const express = require("express");
const router = express.Router();
const rideController = require("../../controllers/ride.controller");

// 주행 기록 조회
router.get("/", rideController.getAllRides);

module.exports = router;
