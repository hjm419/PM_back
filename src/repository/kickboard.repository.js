const db = require("../config/db");

/**
 * 킥보드 Repository
 */
class KickboardRepository {
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
   * pm_id로 킥보드 조회
   * @param {string} pmId
   * @returns {Promise<object|null>}
   */
  static async findById(pmId) {
    try {
      const result = await db.query(
        "SELECT * FROM t_kickboard WHERE pm_id = $1",
        [pmId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 킥보드 생성
   * @param {object} data { pm_id, pm_status, location, battery }
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const { pm_id, pm_status = "available", location, battery } = data;
      const result = await db.query(
        "INSERT INTO t_kickboard (pm_id, pm_status, location, battery) VALUES ($1, $2, $3, $4) RETURNING *",
        [pm_id, pm_status, location, battery]
      );
      return result.rows[0];
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 킥보드 업데이트
   * @param {string} pmId
   * @param {object} updateData
   * @returns {Promise<object|null>}
   */
  static async update(pmId, updateData) {
    try {
      const fields = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
      const values = Object.values(updateData);

      const result = await db.query(
        `UPDATE t_kickboard SET ${fields} WHERE pm_id = $${
          values.length + 1
        } RETURNING *`,
        [...values, pmId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * 킥보드 삭제
   * @param {string} pmId
   * @returns {Promise<boolean>}
   */
  static async delete(pmId) {
    try {
      const result = await db.query(
        "DELETE FROM t_kickboard WHERE pm_id = $1",
        [pmId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }
}

module.exports = KickboardRepository;
