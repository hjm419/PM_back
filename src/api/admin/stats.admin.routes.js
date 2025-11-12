// GET /api/v1/admin/stats/heatmap
const express = require("express");
const router = express.Router();

const statsController = require("../../controllers/stats.controller");

// 위험 로그 분석/조회
router.get("/rides-logs", statsController.getRiskLogs);
// 안전 점수 통계 조회
router.get("/rides/safety-scores", statsController.getSafetyScores);
// 전체/특정 유저 점수 재계산
router.post("/rides/stats", statsController.recalculateStats);
// 주행 기록 조회
router.get("/rides", statsController.getAllRides);

module.exports = router;
