// 인증 비즈니스 로직 (로그인, 토큰 생성 등)
const jwt = require("jsonwebtoken");
const config = require("../config");

class AuthService {
  /**
   * 사용자 로그인
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token, user}>}
   */
  async login(email, password) {
    // TODO: DB에서 사용자 조회 및 비밀번호 검증
    // const user = await User.findByEmail(email);
    // if (!user || !user.verifyPassword(password)) {
    //   throw new Error('Invalid email or password');
    // }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: "temp-id", email, role: "user" },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRATION }
    );

    return { token, user: { email, role: "user" } };
  }

  /**
   * 토큰 검증
   * @param {string} token
   * @returns {Promise<{userId, email, role}>}
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
   * @param {string} email
   * @param {string} password
   * @param {string} name
   * @returns {Promise<{userId, email, name}>}
   */
  async register(email, password, name) {
    // TODO: DB에 사용자 저장
    // const hashedPassword = await hashPassword(password);
    // const user = await User.create({ email, password: hashedPassword, name });
    // return { userId: user.id, email, name };
    return { userId: "temp-id", email, name };
  }
}

module.exports = new AuthService();
