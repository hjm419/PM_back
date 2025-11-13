// 인증 컨트롤러 계층 (Controllers) - "누가 일할지"
const authService = require("../services/auth.service");
const apiResponse = require("../utils/apiResponse");

/**
 * POST /api/auth/login
 * @body { loginId, password }
 * @returns { accessToken, user }
 */
const login = async (req, res, next) => {
  try {
    const { loginId, password } = req.body;
    if (!loginId || !password) {
      return res
        .status(400)
        .json(apiResponse.error("loginId and password are required", 400));
    }
    // 서비스에서 accessToken, user 반환
    const { accessToken, user } = await authService.login(loginId, password);
    return res
      .status(200)
      .json(apiResponse.success({ accessToken, user }, "Login successful"));
  } catch (error) {
    next(error);
  }
};

/**
 * POST api/app/users/register
 * 사용자 회원가입
 * body: { userId, password, nickname, telNum }
 * response: { nickname }
 */
const register = async (req, res, next) => {
  try {
    const { userId, password, nickname, telNum } = req.body;

    if (!userId || !password || !nickname || !telNum) {
      return res
        .status(400)
        .json(
          apiResponse.error(
            "userId, password, nickname and telNum are required",
            400
          )
        );
    }

    const created = await authService.register({
      userId,
      password,
      nickname,
      telNum,
    });

    // Return only the fields required by the spec
    return res
      .status(201)
      .json(
        apiResponse.success(
          { nickname: created.nickname },
          "Registration successful"
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify
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

const logout = async (req, res, next) => {
  try {
    // (참고) JWT는 상태가 없으므로, 클라이언트가 토큰을 삭제하는 것이 핵심입니다.
    // 서버는 이 요청을 받고 "로그아웃 처리됨"을 확인만 해줍니다.
    // (※ 실제 서비스에서는 이 토큰을 '블랙리스트'에 추가하는 로직이 들어갈 수 있습니다.)
    res.status(200).json(apiResponse.success({}, "Logout successful"));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * 관리자 정보 조회
 */
const getAdminMe = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(apiResponse.error("User not authenticated", 401));
    }

    const admin = await authService.getAdminInfo(userId);
    res.status(200).json(apiResponse.success(admin, "Admin info retrieved"));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/me
 * 관리자 프로필 수정
 * Request: { nickname, telno }
 * Response: { userId, loginId, nickname, telno, role }
 */
const updateAdminMe = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { nickname, telno } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json(apiResponse.error("User not authenticated", 401));
    }

    const updateData = {};
    if (nickname) updateData.nickname = nickname;
    if (telno) updateData.telno = telno;

    const updated = await authService.updateAdminInfo(userId, updateData);
    res.status(200).json(apiResponse.success(updated, "Admin profile updated"));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/password
 * 관리자 비밀번호 변경
 */
const changeAdminPassword = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json(apiResponse.error("User not authenticated", 401));
    }

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json(
          apiResponse.error("currentPassword and newPassword are required", 400)
        );
    }

    await authService.changePassword(userId, currentPassword, newPassword);
    res
      .status(200)
      .json(
        apiResponse.success(
          { message: "Password updated successfully" },
          "Password changed"
        )
      );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  verifyToken,
  logout,
  getAdminMe,
  updateAdminMe,
  changeAdminPassword,
};
