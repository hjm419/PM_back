// POST /api/v1/rides/{id}/end
const express = require("express");
const router = express.Router();
const rideController = require("../controllers/ride.controller");
const authMiddleware = require("../middleware/auth.middleware");

// 라이드 시작
router.post("/", authMiddleware.verifyToken, rideController.startRide);

// 라이드 종료
router.post("/:id/end", authMiddleware.verifyToken, rideController.endRide);

// 라이드 히스토리
router.get(
  "/history",
  authMiddleware.verifyToken,
  rideController.getUserRideHistory
);

module.exports = router;
