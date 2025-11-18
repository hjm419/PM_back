// PM_back/src/services/ride.service.js

const { parseGeoJSON } = require("../utils/gis.util");
const RideRepository = require("../repository/ride.repository");
const RidePathRepository = require("../repository/ride-path.repository");
const KickboardRepository = require("../repository/kickboard.repository");
const RiskLogRepository = require("../repository/risk-log.repository");
const KPIRepository = require("../repository/kpi.repository");
const UserRepository = require("../repository/user.repository");

class RideService {
  /**
   * 라이드 시작
   * (★수정★) is_helmet 추가
   */
  async startRide(userId, kickboardId, startLocation) {
    // (★수정★) v1.3 앱 API는 { latitude, longitude }지만,
    // PostGIS 처리를 위해 내부적으로 { lat, lng } 객체로 정규화
    const locationObj = {
      lat: startLocation.latitude || startLocation.lat,
      lng: startLocation.longitude || startLocation.lng,
    };

    const ride = await RideRepository.create({
      user_id: userId,
      pm_id: kickboardId,
      start_loc: locationObj, // (★수정★) DB 컬럼명
      start_time: new Date(),
      is_helmet: startLocation.is_helmet || false, // (★수정★) 헬멧 정보
    });

    // (★신규★) 운행 시작 시, t_kickboard의 상태와 위치도 함께 갱신
    if (ride.pm_id) {
      await KickboardRepository.update(ride.pm_id, {
        pm_status: "in_use", // (상태: 'in_use'로 변경)
        location: locationObj, // (위치: 'start_loc'으로 변경)
      });
    }

    return {
      rideId: ride.ride_id,
      userId: ride.user_id,
      kickboardId: ride.pm_id,
      startTime: ride.start_time,
      // (★수정★) DB가 반환한 GeoJSON 문자열을 파싱 (AS start_location)
      location: parseGeoJSON(ride.start_location),
    };
  }

  /**
   * 라이드 종료, 요금 계산, 점수 반영 (최종)
   */
  async endRide(rideId, endPayload) {
    const ride = await RideRepository.findById(rideId);
    if (!ride) {
      throw new Error("Ride not found");
    }
    const pmId = ride.pm_id;
    // 0. KPI 정보 미리 로드
    const allKpis = await KPIRepository.findAll();
    const kpiMap = {};
    allKpis.forEach((k) => {
      kpiMap[k.kpi_id] = k;
    });

    const riskTypeMapping = {
      sudden_stop: 2,
      sudden_accel: 3,
      sudden_decel: 4,
      sudden_turn: 5,
      helmet_off: 6,
    };

    // 1. 입력값 정리
    const endLocation = endPayload.endLocation || endPayload.location || {};
    const providedDistance = endPayload.distance;
    const isHelmetFlag =
      typeof endPayload.isHelmet === "boolean"
        ? endPayload.isHelmet
        : ride.is_helmet;

    const locationObj = {
      lat: endLocation.latitude || endLocation.lat,
      lng: endLocation.longitude || endLocation.lng,
    };

    // 2. 시간 및 기본 요금 계산
    const startTime = new Date(ride.start_time);
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 60000); // 분 단위

    const baseFare = 1000;
    const timeFare = duration * 200;

    // 3. 위험 로그 저장 및 감점 계산
    let totalDeduction = 0;
    const riskLogs = Array.isArray(endPayload.riskLogs)
      ? endPayload.riskLogs
      : [];

    for (const rl of riskLogs) {
      try {
        let kpiId = rl.kpi_id || rl.kpi || riskTypeMapping[rl.type];
        const kpiData = kpiMap[kpiId];

        if (kpiData) {
          const timestamp = rl.timestamp ? new Date(rl.timestamp) : new Date();
          const lat = rl.latitude || rl.lat || locationObj.lat;
          const lng = rl.longitude || rl.lng || locationObj.lng;

          await RiskLogRepository.create({
            ride_id: rideId,
            kpi_id: kpiData.kpi_id,
            timestamp: timestamp,
            location: { lat, lng },
          });

          totalDeduction += parseFloat(kpiData.weight || 0);
        } else {
          console.warn(`Unknown KPI type for ride ${rideId}:`, rl);
        }
      } catch (err) {
        console.warn("Failed to process risk log:", err.message);
      }
    }

    // 4. 헬멧 미착용 감점
    if (isHelmetFlag === false) {
      const helmetKpi = kpiMap[6];
      if (helmetKpi) {
        totalDeduction += parseFloat(helmetKpi.weight || 0);
      } else {
        totalDeduction += 3.0;
      }
    }

    // 5. 경로 데이터 저장
    const ridePath = Array.isArray(endPayload.ridePath)
      ? endPayload.ridePath
      : null;
    if (ridePath && ridePath.length > 0) {
      try {
        await RidePathRepository.create({
          ride_id: rideId,
          path_data: ridePath, // JSONB 저장
        });
      } catch (err) {
        console.warn("Failed to save ride path:", err.message);
      }
    }

    // [계산] 순수 감점 방식 적용 (0~100점)
    // 거리에 따른 가산점 없음 -> 오래 탄다고 점수를 퍼주지 않음
    // 대신 오래 타면 이 점수가 유저 평점에 '강하게' 반영됨 (UserRepository 역할)
    let computedScore = Math.max(0, 100 - totalDeduction);
    computedScore = Math.floor(computedScore);

    // 6. 1차 업데이트 (거리 계산 위임)
    const updatedRide = await RideRepository.endRideUpdate(rideId, {
      end_location_obj: locationObj,
      end_time: endTime,
      duration: duration,
      fare: 0,
      score: computedScore, // 이번 주행의 점수
    });

    if (!updatedRide) {
      throw new Error("Failed to end ride.");
    }

    // 7. 거리 확정
    const dbDistance = parseFloat(updatedRide.total_distance_km || 0);
    const finalDistance =
      providedDistance && Number(providedDistance) > 0
        ? Number(providedDistance)
        : dbDistance;

    // 8. 최종 요금 계산
    const distanceFare = finalDistance * 100;
    const finalFare = Math.floor(baseFare + timeFare + distanceFare);

    // (★신규★) DB에 최종 요금만 다시 업데이트
    await RideRepository.update(rideId, { fare: finalFare });

    // (★핵심 수정★)
    // 운행 종료 시, t_kickboard의 상태와 위치도 함께 갱신
    if (pmId) {
      await KickboardRepository.update(pmId, {
        pm_status: "available", // (상태: 'available'로 변경)
        location: locationObj, // (위치: 'end_loc'으로 변경)
      });
    }
    // 9. Ride 테이블 최종 확정
    await RideRepository.update(rideId, {
      fare: finalFare,
      is_helmet: isHelmetFlag,
      score: computedScore,
      // total_distance_km: finalDistance // 필요시 주석 해제
    });

    // 10. [핵심] 유저 통계 업데이트 (이동평균 + 거리 가중치)
    // 이번 주행 점수와 거리를 넘김
    if (finalDistance > 0) {
      await UserRepository.updateUserStats(
        ride.user_id,
        computedScore,
        finalDistance
      );
    }

    return {
      rideId: updatedRide.ride_id,
      score: computedScore,
      fare: finalFare,
      distance: finalDistance,
      duration: duration,
    };
  }

  /**
   * 사용자의 라이드 히스토리
   * @param {string} userId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getUserRideHistory(userId, limit = 10) {
    const rides = await RideRepository.findByUserId(userId, limit);
    // (★수정★) GeoJSON 파싱 (AS start_location)
    return rides.map((ride) => ({
      ...ride,
      start_location: parseGeoJSON(ride.start_location),
      end_location: parseGeoJSON(ride.end_location),
    }));
  }

  /**
   * (★수정★) v1.3 명세서 5번 (GET /api/admin/rides)
   * 관리자용 주행 기록 조회 (페이징 및 검색)
   */
  async getAllRidesForAdmin(filters) {
    const { rows, totalCount } = await RideRepository.findAndCountAllAdmin(
      filters
    );

    // v1.3 명세서 응답 형식에 맞게 매핑 + (★수정★) GeoJSON 파싱
    const rides = rows.map((ride) => ({
      rideId: ride.ride_id,
      userId: ride.user_id,
      pmId: ride.pm_id,
      startTime: ride.start_time,
      endTime: ride.end_time,
      startLoc: parseGeoJSON(ride.start_location), // (★수정★) AS start_location
      endLoc: parseGeoJSON(ride.end_location), // (★수정★) AS end_location
      fare: ride.fare,
      safetyScore: ride.score,
      helmetOn: ride.is_helmet, // (★이 줄을 추가★)
    }));

    return { totalCount, rides };
  }

  /**
   * (★수정★) v1.3 명세서 5번 (GET /api/admin/rides/{rideId}/risks)
   * 주행별 위험 로그 조회
   */
  async getRiskLogsByRideId(rideId) {
    const logs = await RiskLogRepository.findByRideIdWithKpiName(rideId);

    // v1.3 명세서 응답 형식에 맞게 매핑 + (★수정★) GeoJSON 파싱
    const mappedLogs = logs.map((log) => ({
      logId: log.log_id,
      kpiId: log.kpi_id,
      kpiName: log.kpi_name || "N/A", // (JOIN 결과)
      timestamp: log.timestamp,
      location: parseGeoJSON(log.location), // (★수정★)
    }));

    return { totalCount: mappedLogs.length, logs: mappedLogs };
  }

  /**
   * (★신규★) v1.3 명세서 (GET /api/admin/rides/{rideId}/path)
   * 주행별 GPS 경로 조회
   * (★버그 수정★)
   */
  async getRidePath(rideId) {
    // 1. DB에서 t_ride_path 테이블의 row를 가져옴
    // (결과 예: [ { path_id: 1, ride_id: 27, path_data: [...] } ])
    const pathRows = await RidePathRepository.findByRideId(rideId);

    // 2. (★수정★) row가 없거나, path_data가 비어있으면 빈 배열 반환
    if (!pathRows || pathRows.length === 0 || !pathRows[0].path_data) {
      return { pathData: [] };
    }

    // 3. (★수정★) jsonb 컬럼(path_data)에 저장된 실제 배열을 가져옴
    const pathArray = pathRows[0].path_data; // 예: [{speed:..., latitude:..., longitude:...}, ...]

    // 4. (★수정★) 이 배열을 프론트엔드가 원하는 형식으로 매핑
    // (DB: latitude, longitude -> 프론트: location: { lat, lng })
    const pathData = pathArray.map((point) => ({
      location: {
        lat: point.latitude, // (DB 컬럼명 기준)
        lng: point.longitude, // (DB 컬럼명 기준)
      },
      speed: point.speed,
      timestamp: point.timestamp,
    }));

    return { pathData: pathData }; // 명세서 형식 { pathData: [...] }
  }

  /**
   * (★신규★) 현재 운행 중인 라이드 목록 조회 (RealtimeView.vue 전용)
   * @returns {Promise<{rides: Array}>}
   */
  async getActiveRidesForAdmin() {
    const rides = await RideRepository.findActiveRidesAdmin();

        // 프론트엔드에서 사용하기 쉽도록 데이터 매핑
        const mappedRides = rides.map((ride) => ({
            rideId: ride.ride_id,
            userId: ride.user_id,
            pmId: ride.pm_id,
            startTime: ride.start_time,
            // (★수정★) Service에서 Alias를 사용해 location/battery를 프론트엔드 형식으로 맞춤
            location: parseGeoJSON(ride.location),
            battery: ride.battery,
            safetyScore: ride.safety_score || 100, // (★추가★)
            accident: ride.accident || false, // (★추가★)
            status: "active", // (★추가★)
        }));
        return { rides: mappedRides };
    }

    /**
     * (★신규★) 최근 24시간 이내 종료된 사고 주행 목록 조회
     * @param {number} hours
     * @returns {Promise<{rides: Array}>}
     */
    async getRecentCompletedAccidents(hours = 24) {
        const interval = `${hours} hours`;
        const rides = await RideRepository.findRecentCompletedAccidents(interval);

        // 프론트엔드에서 사용하기 쉽도록 데이터 매핑
        const mappedRides = rides.map((ride) => ({
            rideId: ride.ride_id,
            userId: ride.user_id,
            pmId: ride.pm_id,
            startTime: ride.start_time, // (UserList.vue 포맷팅을 위해 start_time 전달)
            endTime: ride.end_time, // (★신규★) '종료됨'을 판단하기 위해 endTime 전달
            location: parseGeoJSON(ride.location), // 킥보드의 *현재* 위치/배터리
            battery: ride.battery,
            safetyScore: ride.safety_score || 100,
            accident: ride.accident || false,
            status: "completed", // (★추가★)
        }));
        return { rides: mappedRides };}

  /**
   * 주행 요약 정보 조회
   * @param {string} rideId
   */
  async getRideSummary(rideId) {
    // 1. 주행 기본 정보 조회
    const ride = await RideRepository.findById(rideId);
    if (!ride) {
      throw new Error("Ride not found");
    }

    // 2. 해당 주행의 모든 위험 로그 조회
    const logs = await RiskLogRepository.findByRideId(rideId);

    // 3. Risk Counts 집계 초기화 (요청하신 키 포맷에 맞춤)
    const riskCounts = {
      sudden_start: 0, // 급출발 (KPI 정의에 따라 매핑 필요)
      sudden_accel: 0, // 급가속
      sudden_stop: 0, // 급정지
      sudden_decel: 0, // 급감속
      sudden_turn: 0, // 급회전
    };

    // 4. KPI ID를 응답 키로 매핑 (DB의 T_RISK_KPI ID 기준)
    // 이전 대화의 DB 캡처본 기준: 2=급정지, 3=급가속, 4=급감속, 5=급회전
    // (참고: '급출발'에 대한 ID가 없다면 1번이나 다른 번호로 가정하거나 로직 추가 필요)
    const kpiIdToKey = {
      1: "sudden_start", // 만약 급출발 ID가 1번이라면
      2: "sudden_stop",
      3: "sudden_accel",
      4: "sudden_decel",
      5: "sudden_turn",
    };

    // 5. 로그 루프 돌며 카운팅
    logs.forEach((log) => {
      const key = kpiIdToKey[log.kpi_id];
      if (key && riskCounts.hasOwnProperty(key)) {
        riskCounts[key]++;
      }
    });

    // 6. 응답 데이터 구성
    return {
      summary: {
        rideId: ride.ride_id,
        score: ride.score,
        fare: ride.fare,
        distance: parseFloat(ride.distance || 0), // DB 컬럼명 확인 필요 (distance vs total_distance_km)
        duration: calculateDuration(ride.start_time, ride.end_time), // 아래 헬퍼 함수 참고
        isHelmet: ride.is_helmet,
      },
      riskCounts: riskCounts,
    };
    // (Helper) 분 단위 시간 계산
    function calculateDuration(start, end) {
      if (!start || !end) return 0;
      const diffMs = new Date(end) - new Date(start);
      return Math.floor(diffMs / 60000);
    }
  }
}

module.exports = new RideService();