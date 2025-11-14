const express = require("express");
const router = express.Router();
const kickboardController = require("../../controllers/kickboard.controller");

// 킥보드 신규 등록
router.post("/", kickboardController.createKickboard);
// 킥보드 목록 조회
router.get("/", kickboardController.getAllKickboards);
// 킥보드 상세 조회
router.get("/:pmId", kickboardController.getKickboardById);
// 킥보드 정보/상태 수정
router.put("/:pmId", kickboardController.updateKickboard);
// 킥보드 삭제
router.delete("/:pmId", kickboardController.deleteKickboard);
// (★추가★) v1.3 명세서 - 원격 잠금
// router.post("/:pmId/lock", kickboardController.lockKickboard); // lockKickboard 컨트롤러 필요 (가정)
module.exports = router;
