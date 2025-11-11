// 인증 미들웨어
// ★핵심: 토큰 검증, isAdmin, isUser 역할 분리
const config = require("../config");
const authService = require("../services/auth.service");

/**
 * 토큰 검증 미들웨어
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "토큰이 없습니다" });
    }

    const decoded = await authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "토큰이 유효하지 않습니다" });
  }
};

/**
 * 관리자 권한 확인 미들웨어
 */
const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "관리자 권한이 필요합니다" });
  }
  next();
};

/**
 * 일반 사용자 권한 확인 미들웨어
 */
const isUser = (req, res, next) => {
  if (req.user?.role !== "user") {
    return res.status(403).json({ error: "사용자 권한이 필요합니다" });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isUser,
};
