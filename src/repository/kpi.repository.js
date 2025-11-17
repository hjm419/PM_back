const db = require("../config/db");

/**
 * KPI Repository
 */
class KPIRepository {
  /**
   * 모든 KPI 조회
   * @returns {Promise<array>}
   */
  static async findAll() {
    try {
      const result = await db.query("SELECT * FROM t_risk_kpi");
      return result.rows;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * kpi_id로 KPI 조회
   * @param {Number} kpiId
   * @returns {Promise<object|null>}
   */
  static async findById(kpiId) {
    try {
      // If kpiId is not a number (e.g. client sent 'sudden_turn' or 'kpi_helmet_off'),
      // try resolving by name to avoid integer conversion errors.
      const numericId = Number(kpiId);
      if (!Number.isFinite(numericId) || Number.isNaN(numericId)) {
        // try find by name (fallback)
        return await KPIRepository.findByName(String(kpiId));
      }

      const result = await db.query(
        "SELECT * FROM t_risk_kpi WHERE kpi_id = $1",
        [numericId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * KPI를 이름으로 조회 (case-insensitive)
   * @param {string} name
   * @returns {Promise<object|null>}
   */
  static async findByName(name) {
    try {
      const result = await db.query(
        "SELECT * FROM t_risk_kpi WHERE lower(kpi_name) = lower($1) LIMIT 1",
        [name]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("DB Error (findByName):", error);
      throw error;
    }
  }

  /**
   * KPI 생성
   * @param {object} data { kpi_name, kpi_desc, weight }
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const { kpi_name, kpi_desc, weight } = data;
      const result = await db.query(
        "INSERT INTO t_risk_kpi (kpi_name, kpi_desc, weight) VALUES ($1, $2, $3) RETURNING *",
        [kpi_name, kpi_desc, weight]
      );
      return result.rows[0];
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * KPI 업데이트
   * @param {Number} kpiId
   * @param {object} updateData
   * @returns {Promise<object|null>}
   */
  static async update(kpiId, updateData) {
    try {
      const fields = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
      const values = Object.values(updateData);

      const result = await db.query(
        `UPDATE t_risk_kpi SET ${fields} WHERE kpi_id = $${
          values.length + 1
        } RETURNING *`,
        [...values, kpiId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }

  /**
   * KPI 삭제
   * @param {Number} kpiId
   * @returns {Promise<boolean>}
   */
  static async delete(kpiId) {
    try {
      const result = await db.query(
        "DELETE FROM t_risk_kpi WHERE kpi_id = $1",
        [kpiId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("DB Error:", error);
      throw error;
    }
  }
}

module.exports = KPIRepository;
