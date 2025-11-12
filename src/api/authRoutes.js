// POST /api/auth/login
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

// 컨트롤러(로직) 파일 가져오기
const authController = require("../controllers/auth.controller");

// URL과 로직 연결
router.post("/login", authController.login);
// 관리자 정보 조회
router.get("/me", authMiddleware.verifyToken, authController.getAdminMe);
// 관리자 프로필 수정
router.put("/me", authMiddleware.verifyToken, authController.updateAdminMe);
// 관리자 비밀번호 변경
router.put(
  "/password",
  authMiddleware.verifyToken,
  authController.changeAdminPassword
);
// 토큰 검증
router.post("/verify", authController.verifyToken);
// 로그아웃
router.post("/logout", authMiddleware.verifyToken, authController.logout);

module.exports = router;
