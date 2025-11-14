// GET /api/v1/admin/users
const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");

// 회원 목록 조회
router.get("/", userController.getAllUsers);

// (★신규★) 특정 회원 위험 이력 조회 (페이징)
router.get("/:userId/risks", userController.getUserRiskHistory);

// 특정 회원 상세 조회
router.get("/:userId", userController.getUserById);

module.exports = router;