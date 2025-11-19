const express = require("express");
const router = express.Router();

// 컨트롤러 불러오기
const kpiController = require("../../controllers/kpi.controller");

/**
 * [수정 포인트]
 * 1. 함수 이름을 컨트롤러와 똑같이 맞췄습니다. (createKPI -> create 등)
 * 2. URL 파라미터를 :kpiId -> :id 로 변경했습니다. (컨트롤러가 req.params.id를 쓰기 때문)
 */

// KPI 생성
router.post("/", kpiController.create);

// KPI 목록 조회
router.get("/", kpiController.findAll);

// KPI 항목/가중치 수정
router.put("/:id", kpiController.update);

// KPI 항목 삭제
router.delete("/:id", kpiController.delete);

module.exports = router;