// 라이드 컨트롤러 계층 (Controllers) - "누가 일할지"
const rideService = require("../services/ride.service");
const apiResponse = require("../utils/apiResponse");

/**
 * POST /api/v1/rides
 * 라이드 시작
 */
const startRide = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { kickboardId, startLocation } = req.body;

    if (!userId || !kickboardId || !startLocation) {
      return res
        .status(400)
        .json(
          apiResponse.error(
            "User ID, kickboard ID, and start location are required",
            400
          )
        );
    }

    const result = await rideService.startRide(
      userId,
      kickboardId,
      startLocation
    );
    res.status(201).json(apiResponse.success(result, "Ride started"));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/rides/:id/end
 * 라이드 종료
 */
const endRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { endLocation } = req.body;

    if (!endLocation) {
      return res
        .status(400)
        .json(apiResponse.error("End location is required", 400));
    }

    const result = await rideService.endRide(id, endLocation);
    res.status(200).json(apiResponse.success(result, "Ride ended"));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/rides/history
 * 라이드 히스토리
 */
const getUserRideHistory = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { limit = 10 } = req.query;

    if (!userId) {
      return res
        .status(401)
        .json(apiResponse.error("User not authenticated", 401));
    }

    const history = await rideService.getUserRideHistory(
      userId,
      parseInt(limit)
    );
    res
      .status(200)
      .json(apiResponse.success(history, "Ride history retrieved"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startRide,
  endRide,
  getUserRideHistory,
};
