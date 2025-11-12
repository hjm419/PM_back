// GET /api/v1/users/me
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

// 현재 사용자 정보 조회
router.get("/me", authMiddleware.verifyToken, userController.getMe);
// 현재 사용자 정보 업데이트 (PUT)
router.put("/me", authMiddleware.verifyToken, userController.updateMe);

// 모든 사용자 조회 (관리자 전용)
router.get(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  userController.getAllUsers
);

// 특정 사용자 조회
router.get("/:id", authMiddleware.verifyToken, userController.getUserById);

// 사용자 정보 업데이트
router.put("/:id", authMiddleware.verifyToken, userController.updateUser);

// 사용자 삭제
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  userController.deleteUser
);

module.exports = router;
