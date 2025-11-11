// GET /api/v1/kickboards
const express = require("express");
const router = express.Router();
const kickboardController = require("../controllers/kickboard.controller");
const authMiddleware = require("../middleware/auth.middleware");

// 모든 킥보드 조회
router.get("/", kickboardController.getAllKickboards);

// 특정 킥보드 조회
router.get("/:id", kickboardController.getKickboardById);

// 킥보드 생성 (관리자 전용)
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  kickboardController.createKickboard
);

// 킥보드 정보 업데이트 (관리자 전용)
router.put(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  kickboardController.updateKickboard
);

module.exports = router;
