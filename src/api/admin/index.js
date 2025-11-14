// 관리자 라우터 인덱스
// 관리자 전용 라우트를 그룹으로 관리

const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/auth.middleware");

// 인증 및 관리자 권한 미들웨어를 admin 전체에 적용
router.use(authMiddleware.verifyToken, authMiddleware.isAdmin);

// 관리자 라우터들 가져오기
const userAdminRoutes = require("./user.admin.routes");
const kpiAdminRoutes = require("./kpi.admin.routes");
const kickboardAdminRoutes = require("./kickboard.admin.routes");
const rideAdminRoutes = require("./ride.admin.routes");
const statsAdminRoutes = require("./stats.admin.routes"); // (★추가★) stats 라우터 import
const eventAdminRoutes = require("./events.admin.routes"); // (★추가★) v1.3 명세서 이벤트 로그

// 기본 경로
router.get("/", (req, res) => {
    res.json({ message: "관리자 API 엔드포인트" });
});

// 관리자 라우터 연결
router.use("/users", userAdminRoutes);
router.use("/kpis", kpiAdminRoutes);
router.use("/rides", rideAdminRoutes);
router.use("/kickboards", kickboardAdminRoutes);
router.use("/stats", statsAdminRoutes); // (★추가★) stats 라우터 연결
router.use("/events", eventAdminRoutes); // (★추가★) events 라우터 연결

module.exports = router;