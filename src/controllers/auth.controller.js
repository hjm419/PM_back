// 인증 컨트롤러 계층 (Controllers) - "누가 일할지"
const authService = require("../services/auth.service");
const apiResponse = require("../utils/apiResponse");

/**
 * POST /api/v1/auth/login
 * 사용자 로그인
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(apiResponse.error("Email and password are required", 400));
    }

    const result = await authService.login(email, password);
    res.status(200).json(apiResponse.success(result, "Login successful"));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/register
 * 사용자 회원가입
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json(apiResponse.error("Email, password, and name are required", 400));
    }

    const result = await authService.register(email, password, name);
    res
      .status(201)
      .json(apiResponse.success(result, "Registration successful"));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/verify
 * 토큰 검증
 */
const verifyToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json(apiResponse.error("Token is required", 400));
    }

    const decoded = await authService.verifyToken(token);
    res.status(200).json(apiResponse.success(decoded, "Token is valid"));
  } catch (error) {
    res.status(401).json(apiResponse.error("Invalid token", 401));
  }
};

module.exports = {
  login,
  register,
  verifyToken,
};
