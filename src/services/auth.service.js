// 인증 비즈니스 로직 (로그인, 토큰 생성 등)
const jwt = require("jsonwebtoken");
const config = require("../config");
const UserRepository = require("../repository/user.repository");

class AuthService {
  /**
   * 사용자 로그인
   * @param {string} loginId
   * @param {string} password
   * @returns {Promise<{accessToken, user}>}
   */
  async login(loginId, password) {
    // 1. DB에서 login_id로 사용자 찾기
    const user = await UserRepository.findByLoginId(loginId);

    // 2. 사용자 확인 및 비밀번호 비교
    if (!user || user.user_pw !== password) {
      throw new Error("Invalid loginId or password");
    }

    // 3. JWT 토큰 생성
    const accessToken = jwt.sign(
      { userId: user.user_id, loginId: user.login_id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRATION }
    );

    // 4. 응답 데이터: user 객체 (비밀번호 제외)
    const responseUser = {
      userId: user.user_id,
      loginId: user.login_id,
      nickname: user.nickname,
      role: user.role,
      telno: user.telno,
    };

    return {
      accessToken,
      user: responseUser,
    };
  }

  /**
   * 토큰 검증
   * @param {string} token
   * @returns {Promise<object>}
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * 사용자 회원가입
   * @param {object} param0 { userId, password, nickname, telNum }
   * @returns {Promise<object>} created user
   */
  async register({ userId, password, nickname, telNum }) {
    // 1. 중복 체크 (login_id 기준)
    const existing = await UserRepository.findByLoginId(userId);
    if (existing) {
      const err = new Error("UserId already exists");
      err.status = 409;
      throw err;
    }

    // 2. 사용자 생성
    // Note: UserRepository.create currently expects { login_id, user_pw, nickname, telno }
    const toCreate = {
      login_id: userId,
      user_pw: password,
      nickname: nickname,
      telno: telNum,
    };

    const created = await UserRepository.create(toCreate);

    // Return created user (at least nickname as spec requires)
    return {
      nickname: created.nickname,
      user_id: created.user_id,
      login_id: created.login_id,
    };
  }

  /**
   * 관리자 정보 조회
   * @param {string} userId
   * @returns {Promise<object>} { userId, loginId, nickname, telno, role }
   */
  async getAdminInfo(userId) {
    const admin = await UserRepository.findById(userId);
    if (!admin) {
      throw new Error("Admin not found");
    }
    // 응답 형식에 맞게 매핑
    return {
      userId: admin.user_id,
      loginId: admin.login_id,
      nickname: admin.nickname,
      telno: admin.telno,
      role: admin.role,
    };
  }

  /**
   * 관리자 정보 수정
   * @param {string} userId
   * @param {object} updateData { telno, ... }
   * @returns {Promise<object>} { userId, loginId, nickname, telno, role }
   */
  async updateAdminInfo(userId, updateData) {
    const updated = await UserRepository.update(userId, updateData);
    if (!updated) {
      throw new Error("Admin not found");
    }
    // 응답 형식에 맞게 매핑
    return {
      userId: updated.user_id,
      loginId: updated.login_id,
      nickname: updated.nickname,
      telno: updated.telno,
      role: updated.role,
    };
  }

  /**
   * 관리자 비밀번호 변경
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("Admin not found");
    }

    // 현재 비밀번호 검증
    if (user.user_pw !== currentPassword) {
      const err = new Error("Current password is incorrect");
      err.status = 401;
      throw err;
    }

    // 새 비밀번호로 업데이트
    await UserRepository.update(userId, { user_pw: newPassword });
  }
}

module.exports = new AuthService();
