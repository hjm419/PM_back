// GET /api/v1/admin/users
const express = require("express");
const router = express.Router();
// const authMiddleware = require('../../middleware/auth.middleware');
// const userController = require('../../controllers/user.controller');

// // 모든 사용자 조회 (관리자 전용)
// router.get('/', authMiddleware.isAdmin, userController.getAllUsers);
//
// // 특정 사용자 조회
// router.get('/:id', authMiddleware.isAdmin, userController.getUserById);

router.get("/", (req, res) => {
  res.json({ message: "관리자: 모든 사용자 조회" });
});

module.exports = router;
