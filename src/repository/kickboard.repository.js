// PM_back/src/repository/kickboard.repository.js

const db = require("../config/db");

/**
 * 킥보드 Repository
 */
class KickboardRepository {
    /**
     * (★수정★) PostGIS: ST_AsGeoJSON + t_ride 테이블을 LEFT JOIN
     * (현재 운행 중인 ride의 user_id와 start_time을 함께 조회)
     */
    static async findAll() {
        try {
            const query = `
                SELECT
                    k.pm_id,
                    k.pm_status,
                    ST_AsGeoJSON(k.location) AS location,
                    k.battery,
                    k.model,
                    r.user_id,
                    r.start_time 
                FROM t_kickboard k
                LEFT JOIN t_ride r 
                  ON k.pm_id = r.pm_id AND r.end_time IS NULL -- (★핵심★) 현재 운행중인 주행(end_time=NULL)만 JOIN
            `;
            const result = await db.query(query);
            return result.rows; // location은 JSON 문자열로 반환됨
        } catch (error) {
            console.error("DB Error (findAll Kickboard):", error);
            throw error;
        }
    }

    /**
     * (★수정★) PostGIS: ST_AsGeoJSON + t_ride 테이블을 LEFT JOIN
     */
    static async findById(pmId) {
        try {
            const query = `
                SELECT
                    k.pm_id,
                    k.pm_status,
                    ST_AsGeoJSON(k.location) AS location,
                    k.battery,
                    k.model,
                    r.user_id,
                    r.start_time 
                FROM t_kickboard k
                LEFT JOIN t_ride r 
                  ON k.pm_id = r.pm_id AND r.end_time IS NULL
                WHERE k.pm_id = $1
            `;
            const result = await db.query(query, [pmId]);
            return result.rows[0] || null; // location은 JSON 문자열로 반환됨
        } catch (error) {
            console.error("DB Error (findById Kickboard):", error);
            throw error;
        }
    }

    /**
     * (★수정★) PostGIS: ST_SetSRID(ST_MakePoint(lng, lat), 4326)을 사용하여 geography 타입으로 변환
     * (pm_id, model 컬럼이 DB 스키마와 일치하도록 수정됨)
     */
    static async create(data) {
        try {
            // (참고: ST_MakePoint는 (lng, lat) 순서입니다)
            const { pm_id, pm_status = "available", location, battery, model } = data;

            if (!location || location.lat == null || location.lng == null) {
                throw new Error("Location object {lat, lng} is required.");
            }

            const query = `
                INSERT INTO t_kickboard (pm_id, pm_status, location, battery, model)
                VALUES (
                           $1,
                           $2,
                           ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography,
                           $5,
                           $6
                       )
                    RETURNING pm_id, pm_status, ST_AsGeoJSON(location) AS location, battery, model
            `;

            const values = [
                pm_id,
                pm_status,
                location.lng, // $3 (경도)
                location.lat, // $4 (위도)
                battery,
                model
            ];

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("DB Error (create Kickboard):", error);
            throw error;
        }
    }

    /**
     * (★수정★) PostGIS: ST_MakePoint를 사용하여 location 업데이트
     */
    static async update(pmId, updateData) {
        try {
            const fields = [];
            const values = [];
            let valueIndex = 1;

            // 동적으로 필드 생성
            for (const [key, value] of Object.entries(updateData)) {
                if (value === undefined) continue;

                if (key === 'location') {
                    // location 객체인 경우 PostGIS 함수로 변환
                    if (value && value.lat != null && value.lng != null) {
                        fields.push(`location = ST_SetSRID(ST_MakePoint($${valueIndex++}, $${valueIndex++}), 4326)::geography`);
                        values.push(value.lng, value.lat);
                    }
                } else {
                    // 일반 필드
                    fields.push(`${key} = $${valueIndex++}`);
                    values.push(value);
                }
            }

            if (fields.length === 0) {
                return this.findById(pmId); // 업데이트할 게 없으면 현재 정보 반환
            }

            const query = `
                UPDATE t_kickboard
                SET ${fields.join(", ")}
                WHERE pm_id = $${valueIndex++}
                    RETURNING pm_id, pm_status, ST_AsGeoJSON(location) AS location, battery, model
            `;

            const result = await db.query(query, [...values, pmId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error("DB Error (update Kickboard):", error);
            throw error;
        }
    }

    /**
     * (기존과 동일)
     */
    static async delete(pmId) {
        try {
            const result = await db.query(
                "DELETE FROM t_kickboard WHERE pm_id = $1",
                [pmId]
            );
            return result.rowCount > 0;
        } catch (error) {
            console.error("DB Error (delete Kickboard):", error);
            throw error;
        }
    }
}

module.exports = KickboardRepository;