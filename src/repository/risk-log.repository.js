const db = require("../config/db");

/**
 * 위험로그 Repository
 */
class RiskLogRepository {
  /**
   * ride_id로 위험로그 조회
   * @param {string} rideId
   * @returns {Promise<array>}
   */
  static async findByRideId(rideId) {
    try {
      const result = await db.query(
        "SELECT * FROM t_risk_log WHERE ride_id = $1",
        [rideId]
      );
      return result.rows;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 모든 위험로그 조회
   * @returns {Promise<array>}
   */
  static async findAll() {
    try {
      const result = await db.query("SELECT * FROM t_risk_log");
      return result.rows;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 위험로그 생성
   * @param {object} data { ride_id, kpi_id, timestamp, location }
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const { ride_id, kpi_id, timestamp, location } = data;
      const result = await db.query(
        "INSERT INTO t_risk_log (ride_id, kpi_id, timestamp, location) VALUES ($1, $2, $3, $4) RETURNING *",
        [ride_id, kpi_id, timestamp, location]
      );
      return result.rows[0];
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }
}

module.exports = RiskLogRepository;
