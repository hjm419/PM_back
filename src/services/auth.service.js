// PM_back/src/services/auth.service.js

const jwt = require("jsonwebtoken");
const config = require("../config");

class AuthService {
    /**
     * 사용자 로그인
     * @param {string} login_id
     * @param {string} user_pw
     * @returns {Promise<{token, user}>}
     */
    async login(login_id, user_pw) {
        // const user = await User.findByLoginId(login_id);
        // if (!user || !(await user.verifyPassword(user_pw))) {
        //   throw new Error('Invalid login credentials');
        // }

        // --- (시뮬레이션 수정) ---
        // DB에서 찾았다고 가정한 'user' 객체 (t_user 스키마 기준)
        const foundUser = {
            user_id: "a1b2c3d4-test-id", // ⬅️ Primary Key
            login_id: login_id,           // ⬅️ 로그인 ID
            nickname: "테스트관리자",     // ⬅️ 닉네임
            safety_score: 95,            // ⬅️ 안전 점수
            role: "admin",               // ⬅️ 권한
            user_name: "김테스트",        // ⬅️ 실명
            telno: "010-0000-1111"       // ⬅️ 전화번호
        };

        // JWT 토큰 생성 (필수 정보만 담음)
        const token = jwt.sign(
            { userId: foundUser.user_id, loginId: foundUser.login_id, role: foundUser.role },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRATION }
        );

        // ⬇️ (핵심)
        // token과 사용자 정보 객체(user)를 반환
        return {
            token: token,
            user: foundUser // ⬅️ t_user와 일치하는 사용자 객체
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
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @returns {Promise<object>}
     */
    async register(email, password, name) {
        return { userId: "temp-id", email, name };
    }
}

module.exports = new AuthService();