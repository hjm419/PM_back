// 라이드(킥보드 이용) 비즈니스 로직
// ★프로젝트의 심장: 요금, 거리, 점수 계산
const gisUtil = require("../utils/gis.util");
const RideRepository = require("../repository/ride.repository");
const RidePathRepository = require("../repository/ride-path.repository");
const KickboardRepository = require("../repository/kickboard.repository");

class RideService {
  /**
   * 라이드 시작
   * @param {string} userId
   * @param {string} kickboardId
   * @param {object} startLocation { latitude, longitude }
   * @returns {Promise<{rideId, startTime, location}>}
   */
  async startRide(userId, kickboardId, startLocation) {
    const ride = await RideRepository.create({
      user_id: userId,
      pm_id: kickboardId,
      start_location: startLocation,
      start_time: new Date(),
    });

    return {
      rideId: ride.ride_id,
      userId: ride.user_id,
      kickboardId: ride.pm_id,
      startTime: ride.start_time,
      location: ride.start_location,
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

    // 거리 계산
    const distance = gisUtil.calculateDistance(
      ride.start_location,
      endLocation
    );

    // 지속시간 계산 (분 단위)
    const startTime = new Date(ride.start_time);
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 60000);

    // 요금 계산: 기본 요금 + 거리 요금 + 시간 요금
    const baseFare = 3000; // 기본 요금 (원)
    const distanceFare = distance * 100; // 거리당 100원/km
    const timeFare = duration * 50; // 시간당 50원/분
    const fare = Math.floor(baseFare + distanceFare + timeFare);

    // 점수 계산
    const score = Math.floor(distance * 10);

    // DB에 라이드 종료 정보 업데이트
    const updatedRide = await RideRepository.update(rideId, {
      end_location: endLocation,
      end_time: endTime,
      distance,
      duration,
      fare,
      score,
    });

    return {
      rideId: updatedRide.ride_id,
      distance,
      duration,
      fare,
      score,
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
    return rides;
  }
}

module.exports = new RideService();
