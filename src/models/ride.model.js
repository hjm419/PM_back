// 라이드 모델
const db = require("../config/db");

/**
 * 라이드 스키마 (PostgreSQL)
 * CREATE TABLE t_ride (
 *   id SERIAL PRIMARY KEY,
 *   user_id INT NOT NULL REFERENCES t_user(id),
 *   kickboard_id INT NOT NULL REFERENCES t_kickboard(id),
 *   start_location POINT,
 *   end_location POINT,
 *   start_time TIMESTAMP,
 *   end_time TIMESTAMP,
 *   distance DECIMAL(10, 2), -- km
 *   duration INT, -- 분 단위
 *   fare INT, -- 요금 (원)
 *   score INT, -- 사용자 점수
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

class Ride {
  /**
   * 라이드 생성
   * @param {object} data { user_id, kickboard_id, start_location, start_time }
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const { user_id, kickboard_id, start_location, start_time } = data;
      const result = await db.query(
        "INSERT INTO t_ride (user_id, kickboard_id, start_location, start_time) VALUES ($1, $2, $3, $4) RETURNING *",
        [user_id, kickboard_id, start_location, start_time]
      );
      return result.rows[0];
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * ID로 라이드 조회
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    try {
      const result = await db.query("SELECT * FROM t_ride WHERE id = $1", [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 사용자의 라이드 히스토리
   * @param {number} user_id
   * @param {number} limit
   * @returns {Promise<array>}
   */
  static async findByUserId(user_id, limit = 10) {
    try {
      const result = await db.query(
        "SELECT * FROM t_ride WHERE user_id = $1 ORDER BY start_time DESC LIMIT $2",
        [user_id, limit]
      );
      return result.rows;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 라이드 종료 (정보 업데이트)
   * @param {number} id
   * @param {object} updateData { end_location, end_time, distance, duration, fare, score }
   * @returns {Promise<object>}
   */
  static async update(id, updateData) {
    try {
      const fields = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
      const values = Object.values(updateData);

      const result = await db.query(
        `UPDATE t_ride SET ${fields}, updated_at = NOW() WHERE id = $${
          values.length + 1
        } RETURNING *`,
        [...values, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }
}

module.exports = Ride;
