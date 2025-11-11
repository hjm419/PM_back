// POST /api/v1/auth/login
const express = require("express");
const router = express.Router();

// 컨트롤러(로직) 파일 가져오기
const authController = require("../controllers/auth.controller");

// URL과 로직 연결
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/verify", authController.verifyToken);
router.post("/logout", authController.logout);
module.exports = router;
