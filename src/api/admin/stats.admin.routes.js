// GET /api/v1/admin/stats/heatmap
const express = require("express");
const router = express.Router();
// const authMiddleware = require('../../middleware/auth.middleware');
// const statsController = require('../../controllers/stats.controller');

// // 히트맵 통계
// router.get('/heatmap', authMiddleware.isAdmin, statsController.getHeatmap);
//
// // 기타 통계
// router.get('/', authMiddleware.isAdmin, statsController.getStats);

router.get("/heatmap", (req, res) => {
  res.json({ message: "관리자: 히트맵 통계" });
});

router.get("/", (req, res) => {
  res.json({ message: "관리자: 통계 조회" });
});

module.exports = router;
