// 라이드 경로 모델 (경로 데이터 저장용)
const db = require("../config/db");

/**
 * 라이드 경로 스키마 (PostgreSQL)
 * CREATE TABLE t_ride_path (
 *   id SERIAL PRIMARY KEY,
 *   ride_id INT NOT NULL REFERENCES t_ride(id),
 *   latitude DECIMAL(10, 8),
 *   longitude DECIMAL(11, 8),
 *   timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   speed DECIMAL(5, 2), -- km/h
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

class RidePath {
  /**
   * 경로 데이터 추가
   * @param {number} ride_id
   * @param {object} pathData { latitude, longitude, timestamp, speed }
   * @returns {Promise<object>}
   */
  static async create(ride_id, pathData) {
    try {
      const { latitude, longitude, timestamp, speed } = pathData;
      const result = await db.query(
        "INSERT INTO t_ride_path (ride_id, latitude, longitude, timestamp, speed) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [ride_id, latitude, longitude, timestamp, speed]
      );
      return result.rows[0];
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 라이드의 모든 경로 조회
   * @param {number} ride_id
   * @returns {Promise<array>}
   */
  static async findByRideId(ride_id) {
    try {
      const result = await db.query(
        "SELECT * FROM t_ride_path WHERE ride_id = $1 ORDER BY timestamp ASC",
        [ride_id]
      );
      return result.rows;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }
}

module.exports = RidePath;
