const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const authController = require("../../controllers/auth.controller");
const authMiddleware = require("../../middleware/auth.middleware");

// 회원가입
router.post("/register", authController.register);
// 내 정보 조회
router.get("/me", authMiddleware.verifyToken, userController.getMe);
// 내 정보 수정
router.put("/me", authMiddleware.verifyToken, userController.updateMe);
// 회원 탈퇴
router.delete("/me", authMiddleware.verifyToken, userController.deleteUser);
// 내 주행내역 조회
router.get("/me/rides", authMiddleware.verifyToken, userController.getMyRides);
// 점수 변동 내역
router.get(
  "/me/score-history",
  authMiddleware.verifyToken,
  userController.getScoreHistory
);
// 감점 요인 통계
router.get(
  "/me/score-stats",
  authMiddleware.verifyToken,
  userController.getScoreStats
);

module.exports = router;
