// 킥보드 모델
const db = require("../config/db");

/**
 * 킥보드 스키마 (PostgreSQL)
 * CREATE TABLE t_kickboard (
 *   id SERIAL PRIMARY KEY,
 *   device_id VARCHAR(50) UNIQUE NOT NULL,
 *   status VARCHAR(20) DEFAULT 'available', -- 'available', 'in_use', 'maintenance'
 *   latitude DECIMAL(10, 8),
 *   longitude DECIMAL(11, 8),
 *   battery_level INT DEFAULT 100,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

class Kickboard {
  /**
   * 모든 킥보드 조회
   * @returns {Promise<array>}
   */
  static async findAll() {
    try {
      const result = await db.query("SELECT * FROM t_kickboard");
      return result.rows;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * ID로 킥보드 조회
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    try {
      const result = await db.query("SELECT * FROM t_kickboard WHERE id = $1", [
        id,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 킥보드 생성
   * @param {object} data { device_id, status, latitude, longitude, battery_level }
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const {
        device_id,
        status = "available",
        latitude,
        longitude,
        battery_level = 100,
      } = data;
      const result = await db.query(
        "INSERT INTO t_kickboard (device_id, status, latitude, longitude, battery_level) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [device_id, status, latitude, longitude, battery_level]
      );
      return result.rows[0];
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 킥보드 상태 업데이트
   * @param {number} id
   * @param {object} updateData { status, latitude, longitude, battery_level }
   * @returns {Promise<object>}
   */
  static async update(id, updateData) {
    try {
      const fields = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
      const values = Object.values(updateData);

      const result = await db.query(
        `UPDATE t_kickboard SET ${fields}, updated_at = NOW() WHERE id = $${
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

module.exports = Kickboard;
