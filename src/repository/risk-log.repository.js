// PM_back/src/repository/risk-log.repository.js

const db = require("../config/db");

/**
 * 위험로그 Repository
 */
class RiskLogRepository {
  /**
   * (★수정★) PostGIS: ST_AsGeoJSON 사용
   */
  static async findByRideId(rideId) {
    try {
      const query = `
                SELECT
                    log_id, ride_id, kpi_id, "timestamp",
                    ST_AsGeoJSON(location) AS location, created_at
                FROM t_risk_log
                WHERE ride_id = $1
            `;
      const result = await db.query(query, [rideId]);
      return result.rows;
    } catch (error) {
      console.error("DB Error (findByRideId RiskLog):", error);
      throw error;
    }
  }

  /**
   * (★수정★) PostGIS: ST_AsGeoJSON 사용 (findByRideIdWithKpiName)
   */
  static async findByRideIdWithKpiName(rideId) {
    try {
      // T_RISK_LOG (rl)와 T_RISK_KPI (k)를 kpi_id 기준으로 JOIN
      const query = `
                SELECT
                    rl.log_id,
                    rl.ride_id,
                    rl.kpi_id,
                    k.kpi_name,
                    rl."timestamp",
                    ST_AsGeoJSON(rl.location) AS location
                FROM t_risk_log rl
                         LEFT JOIN t_risk_kpi k ON rl.kpi_id = k.kpi_id
                WHERE rl.ride_id = $1
                ORDER BY rl."timestamp" DESC;
            `;
      const result = await db.query(query, [rideId]);
      return result.rows;
    } catch (error) {
      console.error("DB Error (findByRideIdWithKpiName):", error);
      throw error;
    }
  }

  /**
   * (★수정★) PostGIS: ST_AsGeoJSON 사용
   */
  static async findAll() {
    try {
      const query = `
                SELECT
                    log_id, ride_id, kpi_id, "timestamp",
                    ST_AsGeoJSON(location) AS location, created_at
                FROM t_risk_log
            `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error("DB Error (findAll RiskLog):", error);
      throw error;
    }
  }

  /**
   * (★수정★) PostGIS: ST_MakePoint 사용
   */
  static async create(data) {
    try {
      const { ride_id, kpi_id, timestamp, location } = data;

      if (!location || location.lat == null || location.lng == null) {
        throw new Error("Location object {lat, lng} is required.");
      }

      const query = `
                INSERT INTO t_risk_log (ride_id, kpi_id, "timestamp", location)
                VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography)
                    RETURNING log_id, ride_id, kpi_id, "timestamp", ST_AsGeoJSON(location) AS location
            `;

      const values = [
        ride_id,
        kpi_id,
        timestamp,
        location.lng, // $4
        location.lat, // $5
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("DB Error (create RiskLog):", error);
      throw error;
    }
  }

  /**
   * (★수정★) 특정 사용자의 위험 로그 '페이징' 조회 (상세 팝업용)
   * @param {object} filters { userId, page, size }
   * @returns {Promise<object>} { rows, totalCount }
   */
  static async findAndCountAllByUserId(filters) {
    const {
      userId,
      page = 1,
      size = 5, // (프론트엔드 팝업창 기본 5개)
    } = filters;

    const limitNum = parseInt(size, 10);
    const pageNum = parseInt(page, 10);
    const offset = (pageNum - 1) * limitNum;

    try {
      // t_risk_log (rl) -> t_ride (r) -> t_risk_kpi (k)
      const query = `
                SELECT
                    rl.log_id,
                    k.kpi_name,
                    rl."timestamp"
                FROM t_risk_log rl
                         JOIN t_ride r ON rl.ride_id = r.ride_id
                         JOIN t_risk_kpi k ON rl.kpi_id = k.kpi_id
                WHERE r.user_id = $1::BIGINT -- (★수정★) 타입을 BIGINT로 캐스팅
                ORDER BY rl."timestamp" DESC
                    LIMIT $2 OFFSET $3;
            `;

      const countQuery = `
                SELECT COUNT(rl.log_id)
                FROM t_risk_log rl
                         JOIN t_ride r ON rl.ride_id = r.ride_id
                WHERE r.user_id = $1::BIGINT; -- (★수정★) 타입을 BIGINT로 캐스팅
            `;

      const result = await db.query(query, [userId, limitNum, offset]);
      const countResult = await db.query(countQuery, [userId]);

      return {
        rows: result.rows,
        totalCount: parseInt(countResult.rows[0].count, 10),
      };
    } catch (error) {
      console.error("DB Error (findAndCountAllByUserId RiskLog):", error);
      throw error;
    }
  }

  /**
   * 특정 사용자의 위험 로그를 KPI별로 집계하여 반환
   * @param {string|number} userId
   * @returns {Promise<Array>} [{ kpi_id, kpi_name, count }]
   */
  static async countByUserGroupedByKpi(userId) {
    try {
      const query = `
                SELECT
                    COALESCE(k.kpi_id::text, '') AS kpi_id,
                    COALESCE(k.kpi_name, 'unknown') AS kpi_name,
                    COUNT(rl.log_id) AS count
                FROM t_risk_log rl
                         JOIN t_ride r ON rl.ride_id = r.ride_id
                         LEFT JOIN t_risk_kpi k ON rl.kpi_id = k.kpi_id
                WHERE r.user_id = $1::BIGINT
                GROUP BY k.kpi_id, k.kpi_name
            `;

      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error("DB Error (countByUserGroupedByKpi):", error);
      throw error;
    }
  }
}

module.exports = RiskLogRepository;
