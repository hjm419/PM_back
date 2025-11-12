const express = require("express");
const router = express.Router();
const kickboardController = require("../../controllers/kickboard.controller");
const authMiddleware = require("../../middleware/auth.middleware");

// 주변 킥보드 찾기
router.get("/", kickboardController.getNearbyKickboards);
// 헬멧 착용 인증
router.post(
  "/helmet",
  authMiddleware.verifyToken,
  kickboardController.verifyHelmet
);

module.exports = router;
