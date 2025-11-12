// 사용자 모델 (T_USER, role 컬럼 포함)
const db = require('../config/db');

/**
 * 사용자 스키마 (PostgreSQL)
 * CREATE TABLE t_user (
 * user_id VARCHAR(50) PRIMARY KEY,
 * login_id VARCHAR(255) UNIQUE NOT NULL,
 * user_pw VARCHAR(255) NOT NULL,
 * nickname VARCHAR(100),
 * safety_score INT DEFAULT 100,
 * role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin'
 * user_name VARCHAR(100),
 * telno VARCHAR(20),
 * );
 */

class User {
    /**
     * (★추가★) login_id로 사용자 조회
     * @param {string} loginId
     * @returns {Promise<object|null>}
     */
    static async findByLoginId(loginId) {
        try {
            const result = await db.query('SELECT * FROM t_user WHERE login_id = $1', [loginId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('DB Error:', error);
            throw error;
        }
    }

    /**
     * ID(pk)로 사용자 조회
     * @param {string} id (user_id)
     * @returns {Promise<object|null>}
     */
    static async findById(id) {
        try {
            const result = await db.query('SELECT * FROM t_user WHERE user_id = $1', [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('DB Error:', error);
            throw error;
        }
    }

    /**
     * 모든 사용자 조회
     * @returns {Promise<array>}
     */
    static async findAll() {
        try {
            const result = await db.query('SELECT * FROM t_user');
            return result.rows;
        } catch (error) {
            console.error('DB Error:', error);
            throw error;
        }
    }

    /**
     * 사용자 생성
     * @param {object} userData { login_id, user_pw, user_name, role, ... }
     * @returns {Promise<object>}
     */
    static async create(userData) {
        try {
            // (참고: 실제 회원가입 시 t_user 스키마에 맞게 수정 필요)
            const { login_id, user_pw, user_name, role = 'user' } = userData;
            const result = await db.query(
                'INSERT INTO t_user (login_id, user_pw, user_name, role) VALUES ($1, $2, $3, $4) RETURNING *',
                [login_id, user_pw, user_name, role]
            );
            return result.rows[0];
        } catch (error) {
            console.error('DB Error:', error);
            throw error;
        }
    }

    /**
     * 사용자 업데이트 (user_id 기준)
     * @param {string} id (user_id)
     * @param {object} updateData
     * @returns {Promise<object>}
     */
    static async update(id, updateData) {
        try {
            const fields = Object.keys(updateData)
                .map((key, index) => `${key} = $${index + 1}`)
                .join(', ');
            const values = Object.values(updateData);

            const result = await db.query(
                `UPDATE t_user SET ${fields} WHERE user_id = $${values.length + 1} RETURNING *`,
                [...values, id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('DB Error:', error);
            throw error;
        }
    }

    /**
     * 사용자 삭제 (user_id 기준)
     * @param {string} id (user_id)
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        try {
            const result = await db.query('DELETE FROM t_user WHERE user_id = $1', [id]);
            return result.rowCount > 0;
        } catch (error) {
            console.error('DB Error:', error);
            throw error;
        }
    }
}

module.exports = User;