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
   * (★수정★) 모든 사용자 조회 -> 페이징 및 검색 기능 추가
   * (findAll -> findAndCountAllAdmin)
   * @param {object} filters { page, size, searchKeyword }
   * @returns {Promise<object>} { rows, totalCount }
   */
  static async findAndCountAllAdmin(filters) {
    const { page = 1, size = 10, searchKeyword } = filters;

    const limitNum = parseInt(size, 10);
    const pageNum = parseInt(page, 10);
    const offset = (pageNum - 1) * limitNum;

    // (★수정★) 명세서에 필요한 컬럼만 선택 (created_at 포함)
    let query = `
        SELECT
            user_id, login_id, nickname, safety_score, status, created_at, telno
        FROM t_user
    `;
    let countQuery = `SELECT COUNT(user_id) FROM t_user`;

    const conditions = [];
    const values = [];
    let valueIndex = 1;

    // 1. 기본 조건 (role = 'user') - 관리자는 목록에서 제외
    conditions.push(`role = $${valueIndex++}`);
    values.push("user");

    // 2. 검색어 (searchKeyword)
    if (searchKeyword) {
      // (★수정★) ID, 닉네임, 연락처로 검색
      conditions.push(
        `(login_id ILIKE $${valueIndex} OR nickname ILIKE $${valueIndex} OR telno ILIKE $${valueIndex})`
      );
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
      const countResult = await db.query(
        countQuery,
        values.slice(0, valueIndex - 2) // LIMIT, OFFSET 값 제외
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
   * @param {object} userData { login_id, user_pw, user_name, role, telno }
   * @returns {Promise<object>}
   */
  static async create(userData) {
    try {
      const { login_id, user_pw, user_name, role = "user", telno } = userData;
      const result = await db.query(
        "INSERT INTO t_user (login_id, user_pw, user_name, role, telno) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [login_id, user_pw, user_name, role, telno]
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
}

module.exports = UserRepository;
