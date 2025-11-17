const express = require("express");
const router = express.Router();
const rideController = require("../../controllers/ride.controller");

// (★중요★) 실시간 관제용 (운행 중인 목록)
// (이 부분이 404 오류를 해결합니다)
router.get("/active", rideController.getActiveRides);

// 주행 기록 조회 (RideHistoryTab용)
router.get("/", rideController.getAllRides);

// 주행별 위험 로그 조회
router.get("/:rideId/risks", rideController.getRideRiskLogs);

// 주행별 GPS 경로 조회
router.get("/:rideId/path", rideController.getRidePath);

module.exports = router;