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
                location.lat  // $5
            ];

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("DB Error (create RiskLog):", error);
            throw error;
        }
    }
}

module.exports = RiskLogRepository;