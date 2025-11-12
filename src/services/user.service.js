// 사용자 비즈니스 로직
const User = require('../models/user.model'); // ⬅️ (추가) User 모델 가져오기

class UserService {
    /**
     * 사용자 정보 조회
     * @param {string} userId (t_user의 'user_id' (pk)임)
     * @returns {Promise<{id, email, name, role}>}
     */
    async getUserById(userId) {
        // (★수정★) TODO -> 실제 DB 조회
        const user = await User.findById(userId);
        if (user) {
            // (중요) 비밀번호는 절대 반환하면 안 됨
            delete user.user_pw;
        }
        return user;
    }

    /**
     * 모든 사용자 조회 (관리자용)
     * @returns {Promise<Array>}
     */
    async getAllUsers() {
        // (★수정★) TODO -> 실제 DB 조회
        const users = await User.findAll();
        // 모든 사용자의 비밀번호 필드 제거
        return users.map(user => {
            delete user.user_pw;
            return user;
        });
    }

    /**
     * 사용자 정보 업데이트
     * @param {string} userId (t_user의 'user_id' (pk)임)
     * @param {object} updateData { user_name, telno }
     * @returns {Promise<object>}
     */
    async updateUser(userId, updateData) {
        // (★수정★) TODO -> 실제 DB 업데이트

        // (보안) 업데이트 가능한 필드만 허용
        const allowedUpdates = {
            user_name: updateData.user_name,
            telno: updateData.telno,
            // (참고) nickname 등 다른 필드도 허용하려면 여기에 추가
        };

        // undefined인 필드는 제거 (DB에 null로 업데이트되는 것 방지)
        Object.keys(allowedUpdates).forEach(key => {
            if (allowedUpdates[key] === undefined) {
                delete allowedUpdates[key];
            }
        });

        if (Object.keys(allowedUpdates).length === 0) {
            throw new Error("No valid fields to update");
        }

        const updatedUser = await User.update(userId, allowedUpdates);

        if (updatedUser) {
            delete updatedUser.user_pw; // 비밀번호 제거 후 반환
        }
        return updatedUser;
    }

    /**
     * 사용자 삭제
     * @param {string} userId
     * @returns {Promise<boolean>}
     */
    async deleteUser(userId) {
        // (★수정★) TODO -> 실제 DB 삭제
        return await User.delete(userId);
    }
}

module.exports = new UserService();