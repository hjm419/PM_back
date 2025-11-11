// 위험 구역 라우터
const express = require("express");
const router = express.Router();
const dangerController = require("../controllers/danger.controller");
const authMiddleware = require("../middleware/auth.middleware");

// 위험 구역 조회
router.get("/", dangerController.getDangerZones);

// 위험 구역 등록 (관리자 전용)
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  dangerController.createDangerZone
);

module.exports = router;
