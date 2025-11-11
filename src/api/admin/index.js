// 관리자 라우터 인덱스
// 관리자 전용 라우트를 그룹으로 관리

const express = require("express");
const router = express.Router();

// 관리자 라우터들 가져오기
const userAdminRoutes = require("./user.admin.routes");
const kpiAdminRoutes = require("./kpi.admin.routes");
const statsAdminRoutes = require("./stats.admin.routes");

// 기본 경로
router.get("/", (req, res) => {
  res.json({ message: "관리자 API 엔드포인트" });
});

// 관리자 라우터 연결
router.use("/users", userAdminRoutes);
router.use("/kpis", kpiAdminRoutes);
router.use("/stats", statsAdminRoutes);

module.exports = router;
