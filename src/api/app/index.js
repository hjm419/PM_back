const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");
const kickboardRoutes = require("./kickboard.routes");
const rideRoutes = require("./ride.routes");

router.use("/users", userRoutes);
router.use("/kickboards", kickboardRoutes);
router.use("/rides", rideRoutes);

module.exports = router;
