const express = require("express");
const router = express.Router();
const rideController = require("../../controllers/ride.controller");
const authMiddleware = require("../../middleware/auth.middleware");

// 킥보드 대여
router.post("/start", authMiddleware.verifyToken, rideController.startRide);
// 킥보드 반납
router.post("/:rideId/end", authMiddleware.verifyToken, rideController.endRide);

module.exports = router;
