const db = require("../config/db");

/**
 * 주행경로 Repository
 */
class RidePathRepository {
  /**
   * ride_id로 주행경로 조회
   * @param {string} rideId
   * @returns {Promise<array>}
   */
  static async findByRideId(rideId) {
    try {
      const result = await db.query(
        "SELECT * FROM t_ride_path WHERE ride_id = $1",
        [rideId]
      );
      return result.rows;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 주행경로 생성
   * @param {object} data { ride_id, path_data }
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const { ride_id, path_data } = data;
      const result = await db.query(
        "INSERT INTO t_ride_path (ride_id, path_data) VALUES ($1, $2) RETURNING *",
        [ride_id, path_data]
      );
      return result.rows[0];
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }
}

module.exports = RidePathRepository;
