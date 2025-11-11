// KPI 모델
const db = require("../config/db");

/**
 * KPI 스키마 (PostgreSQL)
 * CREATE TABLE t_kpi (
 *   id SERIAL PRIMARY KEY,
 *   date DATE,
 *   total_rides INT,
 *   total_revenue INT, -- 총 수익 (원)
 *   total_distance DECIMAL(10, 2), -- 총 거리 (km)
 *   avg_ride_time INT, -- 평균 라이드 시간 (분)
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

class KPI {
  /**
   * KPI 생성
   * @param {object} data { date, total_rides, total_revenue, total_distance, avg_ride_time }
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const {
        date,
        total_rides,
        total_revenue,
        total_distance,
        avg_ride_time,
      } = data;
      const result = await db.query(
        "INSERT INTO t_kpi (date, total_rides, total_revenue, total_distance, avg_ride_time) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [date, total_rides, total_revenue, total_distance, avg_ride_time]
      );
      return result.rows[0];
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 날짜별 KPI 조회
   * @param {string} date
   * @returns {Promise<object|null>}
   */
  static async findByDate(date) {
    try {
      const result = await db.query("SELECT * FROM t_kpi WHERE date = $1", [
        date,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 기간별 KPI 조회
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Promise<array>}
   */
  static async findByDateRange(startDate, endDate) {
    try {
      const result = await db.query(
        "SELECT * FROM t_kpi WHERE date BETWEEN $1 AND $2 ORDER BY date ASC",
        [startDate, endDate]
      );
      return result.rows;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }
}

module.exports = KPI;
