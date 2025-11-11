// 라이드(킥보드 이용) 비즈니스 로직
// ★프로젝트의 심장: 요금, 거리, 점수 계산
const gisUtil = require("../utils/gis.util");

class RideService {
  /**
   * 라이드 시작
   * @param {string} userId
   * @param {string} kickboardId
   * @param {object} startLocation { latitude, longitude }
   * @returns {Promise<{rideId, startTime, location}>}
   */
  async startRide(userId, kickboardId, startLocation) {
    // TODO: DB에 라이드 기록 생성
    // const ride = await Ride.create({
    //   userId,
    //   kickboardId,
    //   startLocation,
    //   startTime: new Date(),
    // });
    // return ride;
    return {
      rideId: "temp-ride-id",
      userId,
      kickboardId,
      startTime: new Date(),
      location: startLocation,
    };
  }

  /**
   * 라이드 종료 및 요금 계산
   * @param {string} rideId
   * @param {object} endLocation { latitude, longitude }
   * @returns {Promise<{rideId, distance, duration, fare, score}>}
   */
  async endRide(rideId, endLocation) {
    // TODO: DB에서 라이드 정보 조회
    // const ride = await Ride.findById(rideId);

    // 거리 계산
    const distance = gisUtil.calculateDistance(
      { lat: 36.2267, lng: 128.3646 }, // 임시 시작 위치
      endLocation
    );

    // 지속시간 계산 (분 단위)
    const duration = 30; // 임시 값

    // 요금 계산: 기본 요금 + 거리 요금 + 시간 요금
    const baseFare = 3000; // 기본 요금 (원)
    const distanceFare = distance * 100; // 거리당 100원/km
    const timeFare = duration * 50; // 시간당 50원/분
    const fare = baseFare + distanceFare + timeFare;

    // 점수 계산
    const score = Math.floor(distance * 10);

    // TODO: DB에 라이드 종료 정보 업데이트
    // await Ride.findByIdAndUpdate(rideId, {
    //   endLocation,
    //   endTime: new Date(),
    //   distance,
    //   duration,
    //   fare,
    //   score,
    // });

    return { rideId, distance, duration, fare, score };
  }

  /**
   * 사용자의 라이드 히스토리
   * @param {string} userId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getUserRideHistory(userId, limit = 10) {
    // TODO: DB에서 사용자 라이드 히스토리 조회
    // const rides = await Ride.find({ userId }).limit(limit);
    // return rides;
    return [];
  }
}

module.exports = new RideService();
