// POST /api/v1/admin/kpis
const express = require("express");
const router = express.Router();

const kpiController = require("../../controllers/kpi.controller");

// KPI 항목 신규 등록
router.post("/", kpiController.createKPI);
// KPI 목록 조회
router.get("/", kpiController.getAllKPIs);
// KPI 항목/가중치 수정
router.put("/:kpiId", kpiController.updateKPI);
// KPI 항목 삭제
router.delete("/:kpiId", kpiController.deleteKPI);

module.exports = router;
