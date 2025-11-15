const db = require("../config/db");

/**
 * 사용자 Repository
 */
class UserRepository {
    /**
     * login_id로 사용자 조회
     * @param {string} loginId
     * @returns {Promise<object|null>}
     */
    static async findByLoginId(loginId) {
        try {
            const result = await db.query(
                "SELECT * FROM t_user WHERE login_id = $1",
                [loginId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error("DB Error:", error);
            throw error;
        }
    }

    /**
     * user_id로 사용자 조회
     * @param {string} userId
     * @returns {Promise<object|null>}
     */
    static async findById(userId) {
        try {
            const result = await db.query("SELECT * FROM t_user WHERE user_id = $1", [
                userId,
            ]);
            return result.rows[0] || null;
        } catch (error) {
            console.error("DB Error:", error);
            throw error;
        }
    }

    /**
     * 모든 사용자 조회 -> 페이징 및 검색 기능 추가
     * @param {object} filters { page, size, searchKeyword }
     * @returns {Promise<object>} { rows, totalCount }
     */
    static async findAndCountAllAdmin(filters) {
        const {
            page = 1,
            size = 10,
            searchKeyword,
        } = filters;

        const limitNum = parseInt(size, 10);
        const pageNum = parseInt(page, 10);
        const offset = (pageNum - 1) * limitNum;

        // (수정) SELECT 구문에서 'status' 컬럼 제거, 'role' 추가
        let query = `
            SELECT
                user_id, login_id, nickname, safety_score, created_at, telno, role
            FROM t_user
        `;
        let countQuery = `SELECT COUNT(user_id) FROM t_user`;

        const conditions = [];
        const values = [];
        let valueIndex = 1;

        // 1. 기본 조건 (role = 'user') - 관리자는 목록에서 제외
        conditions.push(`role = $${valueIndex++}`);
        values.push('user');

        // 2. 검색어 (searchKeyword)
        if (searchKeyword) {
            conditions.push(`(login_id ILIKE $${valueIndex} OR nickname ILIKE $${valueIndex} OR telno ILIKE $${valueIndex})`);
            values.push(`%${searchKeyword}%`);
            valueIndex++;
        }

        if (conditions.length > 0) {
            const whereClause = ` WHERE ${conditions.join(" AND ")}`;
            query += whereClause;
            countQuery += whereClause;
        }

        // 3. 정렬 및 페이징
        query += ` ORDER BY created_at DESC LIMIT $${valueIndex++} OFFSET $${valueIndex++}`;
        values.push(limitNum, offset);

        try {
            const result = await db.query(query, values);
            // (수정) 파라미터 개수 오류 수정
            const countResult = await db.query(
                countQuery,
                values.slice(0, values.length - 2) // LIMIT, OFFSET 값 제외
            );

            return {
                rows: result.rows,
                totalCount: parseInt(countResult.rows[0].count, 10),
            };
        } catch (error) {
            console.error("DB Error (findAndCountAllAdmin Users):", error);
            throw error;
        }
    }


    /**
     * 사용자 생성
     * @param {object} userData { login_id, user_pw, nickname, role, telno }
     * @returns {Promise<object>}
     */
    static async create(userData) {
        try {
            const { login_id, user_pw, nickname, role = "user", telNum } = userData;
            const result = await db.query(
                "INSERT INTO t_user (login_id, user_pw, nickname, role, telno) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                [login_id, user_pw, nickname, role, telNum]
            );
            return result.rows[0];
        } catch (error) {
            console.error("DB Error:", error);
            throw error;
        }
    }

    /**
     * 사용자 업데이트
     * @param {string} userId
     * @param {object} updateData
     * @returns {Promise<object|null>}
     */
    static async update(userId, updateData) {
        try {
            const fields = Object.keys(updateData)
                .map((key, index) => `${key} = $${index + 1}`)
                .join(", ");
            const values = Object.values(updateData);

            const result = await db.query(
                `UPDATE t_user SET ${fields} WHERE user_id = $${
                        values.length + 1
                } RETURNING *`,
                [...values, userId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error("DB Error:", error);
            throw error;
        }
    }

    /**
     * 사용자 삭제
     * @param {string} userId
     * @returns {Promise<boolean>}
     */
    static async delete(userId) {
        try {
            const result = await db.query("DELETE FROM t_user WHERE user_id = $1", [
                userId,
            ]);
            return result.rowCount > 0;
        } catch (error) {
            console.error("DB Error:", error);
            throw error;
        }
    }

    /**
     * 특정 사용자의 누적 통계 조회 (상세 팝업용)
     * @param {string} userId
     * @returns {Promise<object|null>} { total_rides, total_payment }
     */
    static async getUserStats(userId) {
        try {
            const query = `
                SELECT
                    COUNT(ride_id) AS "total_rides",
                    SUM(fare) AS "total_payment"
                FROM t_ride
                WHERE user_id = $1
            `;
            const result = await db.query(query, [userId]);
            return result.rows[0] || { total_rides: 0, total_payment: 0 };
        } catch (error) {
            console.error("DB Error (getUserStats):", error);
            throw error;
        }
    }

    /**
     * (★신규★)
     * 안전 점수 낮은 사용자 Top 5 조회 (대시보드용)
     * @param {number} limit
     * @returns {Promise<Array>}
     */
    static async findTopRiskUsers(limit = 5) {
        try {
            const query = `
                SELECT user_id, nickname, safety_score
                FROM t_user
                WHERE role = 'user'
                ORDER BY safety_score ASC
                    LIMIT $1;
            `;
            const result = await db.query(query, [limit]);
            return result.rows;
        } catch (error)
        {
            console.error("DB Error (findTopRiskUsers):", error);
            throw error;
        }
    }

    /**
     * (★신규 추가★) 앱 전용: 거리, 시간까지 포함한 통계 조회
     */
    static async getUserProfileStats(userId) {
        try {
            const query = `
                SELECT
                    COUNT(ride_id) AS "total_rides",
                    COALESCE(SUM(distance), 0) AS "total_distance",
                    COALESCE(SUM(duration), 0) AS "total_duration"
                FROM t_ride
                WHERE user_id = $1
            `;
            const result = await db.query(query, [userId]);
            return result.rows[0] || {
                total_rides: 0,
                total_distance: 0,
                total_duration: 0
            };
        } catch (error) {
            console.error("DB Error (getUserProfileStats):", error);
            throw error;
        }
    }
}

module.exports = UserRepository;