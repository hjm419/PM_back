const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const authController = require("../../controllers/auth.controller");
const authMiddleware = require("../../middleware/auth.middleware");

// 회원가입
router.post("/register", authController.register);
// 내 정보 조회
router.get("/me", authMiddleware.verifyToken, userController.getMe);
// (신규) 내 정보 상세 조회 (설정화면용 - 통계 포함)
router.get("/me/profile", authMiddleware.verifyToken, userController.getUserProfile);
// 내 정보 수정
router.put("/me", authMiddleware.verifyToken, userController.updateMe);
// 회원 탈퇴
router.delete("/me", authMiddleware.verifyToken, userController.deleteUser);
// 내 주행내역 조회
router.get("/me/rides", authMiddleware.verifyToken, userController.getMyRides);



module.exports = router;
