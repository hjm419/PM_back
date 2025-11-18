// PM_back/src/controllers/ride.controller.js

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
 * POST /api/rides/:id/end
 * 라이드 종료
 */
const endRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const payload = req.body || {};

        // endLocation is required
        const endLocation =
            payload.endLocation || payload.end_location || payload.location;
        if (
            !endLocation ||
            (endLocation.latitude == null && endLocation.lat == null)
        ) {
            return res
                .status(400)
                .json(apiResponse.error("End location is required", 400));
        }

        const result = await rideService.endRide(rideId, payload);
        res.status(200).json(apiResponse.success(result, "Ride ended"));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/rides/history
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

/**
 * GET /api/admin/rides
 * 전체 주행 기록 조회 (관리자용)
 */
const getAllRides = async (req, res, next) => {
    try {
        // (★수정★) v1.3 명세서의 모든 Query Params를 service로 전달
        const filters = {
            page: req.query.page,
            size: req.query.size,
            userId: req.query.userId,
            pmId: req.query.pmId,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };

        const { totalCount, rides } = await rideService.getAllRidesForAdmin(
            filters
        );

        res
            .status(200)
            .json(apiResponse.success({ totalCount, rides }, "All rides retrieved"));
    } catch (error) {
        next(error);
    }
};

/**
 * (★수정★) v1.3 명세서 5번 (GET /api/admin/rides/{rideId}/risks)
 * 주행별 위험 로그 조회
 */
const getRideRiskLogs = async (req, res, next) => {
    try {
        const { rideId } = req.params;

        // (★수정★) TODO -> rideService 호출
        const { totalCount, logs } = await rideService.getRiskLogsByRideId(rideId);

        res
            .status(200)
            .json(
                apiResponse.success({ totalCount, logs }, "Ride risk logs retrieved")
            );
    } catch (error) {
        next(error);
    }
};

/**
 * (★신규★) v1.3 명세서 (GET /api/admin/rides/{rideId}/path)
 * 주행별 GPS 경로 조회
 */
const getRidePath = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const pathData = await rideService.getRidePath(rideId);
        res.status(200).json(apiResponse.success(pathData, "Ride path retrieved"));
    } catch (error) {
        next(error);
    }
};

/**
 * (★신규★) GET /api/admin/rides/active
 * 현재 운행 중인 라이드 목록 조회 (실시간 관제용)
 */
const getActiveRides = async (req, res, next) => {
    try {
        const { rides } = await rideService.getActiveRidesForAdmin();
        // (★수정★) 프론트엔드가 kickboards 키를 기대하므로 kickboards로 보냄
        res
            .status(200)
            .json(
                apiResponse.success(
                    { totalCount: rides.length, kickboards: rides },
                    "Active rides retrieved"
                )
            );
    } catch (error) {
        next(error);
    }
};
const getRideSummary = async (req, res) => {
  try {
    const { rideId } = req.params;

    const result = await rideService.getRideSummary(rideId);

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error("Error getting ride summary:", error);
    if (error.message === "Ride not found") {
      return res.status(404).json({ message: "주행 기록을 찾을 수 없습니다." });
    }
    return res.status(500).json({ message: "서버 내부 오류" });
  }
};

/**
 * (★신규★) GET /api/admin/rides/recent-accidents
 * 최근 종료된 사고 주행 목록 조회 (캐시용)
 */
const getRecentCompletedAccidents = async (req, res, next) => {
    try {
        const { hours = 24 } = req.query; // (기본값 24시간)
        const { rides } = await rideService.getRecentCompletedAccidents(
            parseInt(hours)
        );
        res
            .status(200)
            .json(
                apiResponse.success(
                    { totalCount: rides.length, kickboards: rides },
                    "Recent completed accidents retrieved"
                )
            );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    startRide,
    endRide,
    getUserRideHistory,
    getAllRides,
    getRideRiskLogs,
    getRidePath,
    getActiveRides,
    getRideSummary,
    getRecentCompletedAccidents, // (★신규★)
};