const express = require("express");
const router = express.Router();
const kickboardController = require("../../controllers/kickboard.controller");
const authMiddleware = require("../../middleware/auth.middleware");

// Multer 설정: 이미지를 메모리(RAM)에 임시 저장
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// 주변 킥보드 찾기
router.get("/", kickboardController.getNearbyKickboards);

// 헬멧 착용 인증
router.post(
  "/helmet",
  authMiddleware.verifyToken,
    upload.single('image'),
  kickboardController.verifyHelmet
);

module.exports = router;
