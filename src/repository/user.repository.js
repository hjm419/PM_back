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
   * 모든 사용자 조회
   * @returns {Promise<array>}
   */
  static async findAll() {
    try {
      const result = await db.query("SELECT * FROM t_user");
      return result.rows;
    } catch (error) {
      console.error("DB Error:", error);
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
}

module.exports = UserRepository;
