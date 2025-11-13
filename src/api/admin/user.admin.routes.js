// GET /api/admin/users
const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");

// 회원 목록 조회
router.get("/", userController.getAllUsers);

// 특정 회원 상세 조회
router.get("/:userId", userController.getUserById);

module.exports = router;
