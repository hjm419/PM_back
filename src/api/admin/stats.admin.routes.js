// PM_back/src/api/admin/stats.admin.routes.js

const express = require("express");
const router = express.Router();

const statsController = require("../../controllers/stats.controller");

// (★수정★) v1.3 명세서 기준으로 경로 수정 및 누락된 경로 추가

// 1. (기존) 위험 로그 분석/조회 -> v1.3에서 /api/admin/rides/{rideId}/risks로 이동됨
// router.get("/rides-logs", statsController.getRiskLogs); // (삭제)

// 2. (수정) 안전 점수 통계 조회 (StatsView.vue)
// (기존) router.get("/rides/safety-scores", statsController.getSafetyScores);
// (v1.3)
router.get("/safety-scores", statsController.getSafetyScores);

// 3. (기존) 전체/특정 유저 점수 재계산 (기능 유지)
router.post("/rides/stats", statsController.recalculateStats);

// 4. (기존) 주행 기록 조회 -> v1.3에서 /api/admin/rides로 이동됨
// router.get("/rides", statsController.getAllRides); // (★삭제★) 이 부분이 오류의 원인입니다.

// --- (★이하 v1.3 명세서 누락된 API 대량 추가★) ---

// 5. 대시보드 KPI 4종 (GET /api/admin/stats/kpis)
router.get("/kpis", statsController.getDashboardKpis);

// 6. KPI 트렌드 (GET /api/admin/stats/kpi-trends)
router.get("/kpi-trends", statsController.getKpiTrends);

// 7. 위험 행동 유형 (파이 차트) (GET /api/admin/stats/risk-types)
router.get("/risk-types", statsController.getRiskTypes);

// 8. Top 5 위험 지역 (GET /api/admin/stats/top-risk-regions)
router.get("/top-risk-regions", statsController.getTopRiskRegions);

// 9. 시간대별 위험도 (GET /api/admin/stats/hourly-risk)
router.get("/hourly-risk", statsController.getHourlyRisk);

// 10. 월별 평균 안전 점수 (대시보드) (GET /api/admin/stats/monthly-safety-scores)
router.get("/monthly-safety-scores", statsController.getMonthlySafetyScores);

// 11. 지역별 안전 점수 (통계) (GET /api/admin/stats/regional-scores)
router.get("/regional-scores", statsController.getRegionalScores);

// 12. 사용자 그룹별 비교 (통계) (GET /api/admin/stats/user-group-comparison)
router.get("/user-group-comparison", statsController.getUserGroupComparison);


module.exports = router;