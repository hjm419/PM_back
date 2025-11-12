// 메인 라우터: app.use('/api', ...)
const express = require("express");
const router = express.Router();

// 라우터 파일들 가져오기

const authRoutes = require("./authRoutes");
const appRoutes = require("./app");
const adminRoutes = require("./admin");

// 기본 경로
router.get("/", (req, res) => {
  res.json({ message: "API 엔드포인트" });
});

// 라우터 연결
router.use("/auth", authRoutes);
router.use("/app", appRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
