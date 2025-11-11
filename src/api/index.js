// 메인 라우터: app.use('/api/v1', ...)
const express = require("express");
const router = express.Router();

// 라우터 파일들 가져오기
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const kickboardRoutes = require("./kickboard.routes");
const rideRoutes = require("./ride.routes");
const dangerRoutes = require("./danger.routes");
const adminRoutes = require("./admin");

// 기본 경로
router.get("/", (req, res) => {
  res.json({ message: "API 엔드포인트" });
});

// 라우터 연결
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/kickboards", kickboardRoutes);
router.use("/rides", rideRoutes);
router.use("/danger", dangerRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
