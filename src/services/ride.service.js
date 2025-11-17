// PM_back/src/services/ride.service.js

const { parseGeoJSON } = require("../utils/gis.util");
const RideRepository = require("../repository/ride.repository");
const RidePathRepository = require("../repository/ride-path.repository");
const KickboardRepository = require("../repository/kickboard.repository");
const RiskLogRepository = require("../repository/risk-log.repository");

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
            lng: startLocation.longitude || startLocation.lng
        };

        const ride = await RideRepository.create({
            user_id: userId,
            pm_id: kickboardId,
            start_loc: locationObj, // (★수정★) DB 컬럼명
            start_time: new Date(),
            is_helmet: startLocation.is_helmet || false // (★수정★) 헬멧 정보
        });

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
     * 라이드 종료 및 요금 계산
     * @param {string} rideId
     * @param {object} endLocation { latitude, longitude }
     * @returns {Promise<{rideId, distance, duration, fare, score}>}
     */
    async endRide(rideId, endLocation) {
        const ride = await RideRepository.findById(rideId);
        if (!ride) {
            throw new Error("Ride not found");
        }

        const locationObj = {
            lat: endLocation.latitude || endLocation.lat,
            lng: endLocation.longitude || endLocation.lng
        };

        // 지속시간 계산 (분 단위)
        const startTime = new Date(ride.start_time);
        const endTime = new Date();
        const duration = Math.floor((endTime - startTime) / 60000);

        const baseFare = 3000;
        const timeFare = duration * 50;

        // (임시) 점수 계산
        const score = 90; // (임시 점수)

        // (★수정★) DB에 요금/점수/시간/종료위치 전달. DB가 거리를 계산함.
        const updatedRide = await RideRepository.endRideUpdate(rideId, {
            end_location_obj: locationObj,
            end_time: endTime,
            duration: duration,
            fare: 0, // (임시)
            score: score,
        });

        if (!updatedRide) {
            throw new Error("Failed to end ride.");
        }

        // (★신규★) DB에서 계산된 거리(updatedRide.distance)로 최종 요금 계산
        const finalDistance = parseFloat(updatedRide.distance || 0);
        const distanceFare = finalDistance * 100; // 거리당 100원/km
        const finalFare = Math.floor(baseFare + timeFare + distanceFare);

        // (★신규★) DB에 최종 요금만 다시 업데이트
        await RideRepository.update(rideId, { fare: finalFare });

        return {
            rideId: updatedRide.ride_id,
            distance: finalDistance,
            duration: updatedRide.duration,
            fare: finalFare,
            score: updatedRide.score,
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
        return rides.map(ride => ({
            ...ride,
            start_location: parseGeoJSON(ride.start_location),
            end_location: parseGeoJSON(ride.end_location)
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
            endLoc: parseGeoJSON(ride.end_location),   // (★수정★) AS end_location
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
        const mappedLogs = logs.map(log => ({
            logId: log.log_id,
            kpiId: log.kpi_id,
            kpiName: log.kpi_name || 'N/A', // (JOIN 결과)
            timestamp: log.timestamp,
            location: parseGeoJSON(log.location) // (★수정★)
        }));

        return { totalCount: mappedLogs.length, logs: mappedLogs };
    }

    /**
     * (★신규★) v1.3 명세서 (GET /api/admin/rides/{rideId}/path)
     * 주행별 GPS 경로 조회
     */
    async getRidePath(rideId) {
        const pathRows = await RidePathRepository.findByRideId(rideId);

        const pathData = pathRows.map(row => ({
            location: parseGeoJSON(row.location), // (★PostGIS 파싱★)
            speed: row.speed,
            timestamp: row.timestamp
        }));

        return { pathData: pathData }; // 명세서 형식 { pathData: [...] }
    }

    /**
     * (★수정★) 현재 운행 중인 라이드 목록 조회 (RealtimeView.vue 전용)
     * @returns {Promise<{rides: Array}>}
     */
    async getActiveRidesForAdmin() {
        const rides = await RideRepository.findActiveRidesAdmin();

        // 프론트엔드에서 사용하기 쉽도록 데이터 매핑
        const mappedRides = rides.map(ride => ({
            rideId: ride.ride_id,
            userId: ride.user_id,
            pmId: ride.pm_id,
            startTime: ride.start_time,
            // (★수정★) Service에서 Alias를 사용해 location/battery를 프론트엔드 형식으로 맞춤
            location: parseGeoJSON(ride.location),
            battery: ride.battery,
            safetyScore: ride.safety_score || 100 // (★추가★)
        }));
        return { rides: mappedRides };
    }

}

module.exports = new RideService();