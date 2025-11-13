const db = require("../config/db");

/**
 * 주행 Repository
 */
class RideRepository {
  /**
   * 모든 주행 조회
   * @returns {Promise<array>}
   */
  static async findAll() {
    try {
      const result = await db.query("SELECT * FROM t_ride");
      return result.rows;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * ride_id로 주행 조회
   * @param {string} rideId
   * @returns {Promise<object|null>}
   */
  static async findById(rideId) {
    try {
      const result = await db.query("SELECT * FROM t_ride WHERE ride_id = $1", [
        rideId,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 사용자의 주행 기록 조회
   * @param {string} userId
   * @returns {Promise<array>}
   */
  static async findByUserId(userId) {
    try {
      const result = await db.query("SELECT * FROM t_ride WHERE user_id = $1", [
        userId,
      ]);
      return result.rows;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 주행 생성
   * @param {object} data { user_id, pm_id, start_time, end_time, start_loc, end_loc, fare }
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const { user_id, pm_id, start_time, start_loc } = data;
      const result = await db.query(
        "INSERT INTO t_ride (user_id, pm_id, start_time, start_loc) VALUES ($1, $2, $3, $4) RETURNING *",
        [user_id, pm_id, start_time, start_loc]
      );
      return result.rows[0];
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 주행 업데이트
   * @param {string} rideId
   * @param {object} updateData
   * @returns {Promise<object|null>}
   */
  static async update(rideId, updateData) {
    try {
      const fields = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
      const values = Object.values(updateData);

      const result = await db.query(
        `UPDATE t_ride SET ${fields} WHERE ride_id = $${
          values.length + 1
        } RETURNING *`,
        [...values, rideId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 주행 삭제
   * @param {string} rideId
   * @returns {Promise<boolean>}
   */
  static async delete(rideId) {
    try {
      const result = await db.query("DELETE FROM t_ride WHERE ride_id = $1", [
        rideId,
      ]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }
}

module.exports = RideRepository;
