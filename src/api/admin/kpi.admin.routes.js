// POST /api/v1/admin/kpis
const express = require("express");
const router = express.Router();
// const authMiddleware = require('../../middleware/auth.middleware');
// const kpiController = require('../../controllers/kpi.controller');

// // KPI 생성 (관리자 전용)
// router.post('/', authMiddleware.isAdmin, kpiController.createKPI);
//
// // KPI 조회
// router.get('/', authMiddleware.isAdmin, kpiController.getAllKPIs);

router.post("/", (req, res) => {
  res.json({ message: "관리자: KPI 생성" });
});

module.exports = router;
