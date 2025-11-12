// 인증 비즈니스 로직 (로그인, 토큰 생성 등)
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/user.model"); // ⬅️ (★추가★) User 모델 가져오기

class AuthService {
    /**
     * 사용자 로그인
     * @param {string} login_id
     * @param {string} user_pw
     * @returns {Promise<{token, user}>}
     */
    async login(login_id, user_pw) {
        // --- (★수정★) 시뮬레이션 제거 ---

        // 1. (★수정★) DB에서 login_id로 사용자 찾기
        const user = await User.findByLoginId(login_id);

        // 2. (★수정★) 사용자 확인 및 비밀번호 비교
        // (⚠️ 보안 경고: 실제 서비스에서는 user.user_pw !== user_pw 대신
        //    bcrypt.compare(user_pw, user.user_pw)를 사용해야 합니다.)
        if (!user || user.user_pw !== user_pw) {
            throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        // (중요) 프론트엔드로 보내기 전, 비밀번호 정보 삭제
        delete user.user_pw;

        // 3. JWT 토큰 생성 (필수 정보만 담음)
        const token = jwt.sign(
            { userId: user.user_id, loginId: user.login_id, role: user.role },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRATION }
        );

        // 4. (★수정★) 실제 DB에서 찾은 user 객체 반환
        return {
            token: token,
            user: user // ⬅️ DB에서 가져온 실제 사용자 객체
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
        // (참고) t_user 스키마에 맞게 회원가입 로직도 수정 필요
        return { userId: "temp-id", email, name };
    }
}

module.exports = new AuthService();