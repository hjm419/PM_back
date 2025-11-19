// PM_back/src/repository/kpi.repository.js

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
            const result = await db.query("SELECT * FROM t_risk_kpi ORDER BY kpi_id ASC");
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
            const numericId = Number(kpiId);
            if (!Number.isFinite(numericId) || Number.isNaN(numericId)) {
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
            // kpi_id는 DB에서 자동 증가하거나, MAX(id)+1 로직이 있다면 쿼리 수정 필요.
            // 여기서는 SERIAL이라고 가정하거나, 입력받은 값 그대로 넣음.
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

    /**
     * (★추가됨★) KPI 통계 조회 (가중치 추천 로직용)
     * 사고 주행 vs 정상 주행에서의 KPI 발생 횟수 집계
     */
    static async getKpiStats() {
        try {
            const query = `
            SELECT 
                k.kpi_id, 
                k.kpi_name, 
                k.weight as current_weight,
                -- 사고 주행(accident=true) 중 해당 KPI 발생 횟수
                COUNT(CASE WHEN r.accident = true THEN 1 END) as accident_count,
                -- 정상 주행(accident=false) 중 해당 KPI 발생 횟수
                COUNT(CASE WHEN r.accident = false THEN 1 END) as normal_count
            FROM t_risk_kpi k
            LEFT JOIN t_risk_log rl ON k.kpi_id = rl.kpi_id
            LEFT JOIN t_ride r ON rl.ride_id = r.ride_id
            GROUP BY k.kpi_id, k.kpi_name, k.weight
        `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error("DB Error (getKpiStats):", error);
            throw error;
        }
    }
}

module.exports = KPIRepository;