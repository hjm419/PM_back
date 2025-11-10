const express = require('express');
const router = express.Router();

// 컨트롤러(로직) 파일 가져오기
const authController = require('../controllers/auth.controller');

// URL과 로직 연결
// POST /auth/login 요청이 오면 authController.login 함수를 실행
router.post('/login', authController.login);

// router.post('/register', authController.register); // (나중에 추가)
// router.get('/me', authController.getMe);           // (나중에 추가)

module.exports = router;