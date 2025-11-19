// POST /api/v1/admin/kpis
const express = require("express");
const router = express.Router();

const kpiController = require("../../controllers/kpi.controller");

router.post("/", kpiController.create);

// KPI 목록 조회
router.get("/", kpiController.findAll);

// KPI 항목/가중치 수정
router.put("/:id", kpiController.update);

// KPI 항목 삭제
router.delete("/:id", kpiController.delete);

// kpi 가중치 추전
router.get("/recommend", kpiController.getRecommendedWeights);

module.exports = router;
