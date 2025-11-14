const express = require("express");
const router = express.Router();
const rideController = require("../../controllers/ride.controller");

// (★신규★) 실시간 관제용 (운행 중인 목록)
// (참고: /rides 보다 위에 있어야 /:rideId/risks 보다 우선순위를 가집니다)
router.get("/active", rideController.getActiveRides);

// 주행 기록 조회 (RideHistoryTab용)
router.get("/", rideController.getAllRides);

// 주행별 위험 로그 조회
router.get("/:rideId/risks", rideController.getRideRiskLogs);

// 주행별 GPS 경로 조회
router.get("/:rideId/path", rideController.getRidePath);

module.exports = router;