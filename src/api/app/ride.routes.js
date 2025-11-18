const express = require("express");
const router = express.Router();
const rideController = require("../../controllers/ride.controller");
const authMiddleware = require("../../middleware/auth.middleware");

// 운전 내역 상세 조회
router.get(
  "/:rideId/summary",
  authMiddleware.verifyToken,
  rideController.getRideSummary
);
//  주행 시작
router.post("/start", authMiddleware.verifyToken, rideController.startRide);
// 주행 종료
router.post("/:rideId/end", authMiddleware.verifyToken, rideController.endRide);

module.exports = router;
