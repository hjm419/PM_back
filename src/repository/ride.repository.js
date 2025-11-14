// PM_back/src/repository/ride.repository.js

const db = require("../config/db");

/**
 * 주행 Repository
 */
class RideRepository {
    /**
     * (★수정★) PostGIS: ST_AsGeoJSON + DB 컬럼명(start_loc) 사용 + Alias(start_location)
     */
    static async findAll() {
        try {
            const query = `
                SELECT
                    ride_id, user_id, pm_id,
                    ST_AsGeoJSON(start_loc) AS start_location,
                    ST_AsGeoJSON(end_loc) AS end_location,
                    start_time, end_time, distance, duration, fare, score
                FROM t_ride
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error("DB Error (findAll Ride):", error);
            throw error;
        }
    }

    /**
     * (★수정★) PostGIS: ST_AsGeoJSON + DB 컬럼명(start_loc) 사용 + Alias(start_location)
     */
    static async findAndCountAllAdmin(filters) {
        const {
            page = 1,
            size = 10,
            userId,
            pmId,
            startDate,
            endDate,
        } = filters;

        const limitNum = parseInt(size, 10);
        const pageNum = parseInt(page, 10);
        const offset = (pageNum - 1) * limitNum;

        // (★수정★) ST_AsGeoJSON + DB 컬럼명
        let query = `
            SELECT
                ride_id, user_id, pm_id,
                ST_AsGeoJSON(start_loc) AS start_location,
                ST_AsGeoJSON(end_loc) AS end_location,
                start_time, end_time, distance, duration, fare, score
            FROM t_ride
        `;
        let countQuery = `SELECT COUNT(ride_id) FROM t_ride`;

        const conditions = [];
        const values = [];
        let valueIndex = 1;

        if (userId) {
            conditions.push(`user_id = $${valueIndex++}`);
            values.push(userId);
        }
        if (pmId) {
            conditions.push(`pm_id = $${valueIndex++}`);
            values.push(pmId);
        }
        if (startDate) {
            conditions.push(`start_time >= $${valueIndex++}`);
            values.push(startDate);
        }
        if (endDate) {
            conditions.push(`start_time <= $${valueIndex++}`);
            values.push(endDate + " 23:59:59");
        }

        if (conditions.length > 0) {
            const whereClause = ` WHERE ${conditions.join(" AND ")}`;
            query += whereClause;
            countQuery += whereClause;
        }

        query += ` ORDER BY start_time DESC LIMIT $${valueIndex++} OFFSET $${valueIndex++}`;
        values.push(limitNum, offset);

        try {
            const result = await db.query(query, values);
            const countResult = await db.query(
                countQuery,
                values.slice(0, values.length - 2) // LIMIT, OFFSET 값 제외
            );
            return {
                rows: result.rows,
                totalCount: parseInt(countResult.rows[0].count, 10),
            };
        } catch (error) {
            console.error("DB Error (findAndCountAllAdmin):", error);
            throw error;
        }
    }


    /**
     * (★수정★) PostGIS: ST_AsGeoJSON + DB 컬럼명
     */
    static async findById(rideId) {
        try {
            const query = `
                SELECT
                    ride_id, user_id, pm_id,
                    ST_AsGeoJSON(start_loc) AS start_location,
                    ST_AsGeoJSON(end_loc) AS end_location,
                    start_time, end_time, distance, duration, fare, score
                FROM t_ride
                WHERE ride_id = $1
            `;
            const result = await db.query(query, [rideId]);
            return result.rows[0] || null; // location은 JSON 문자열
        } catch (error) {
            console.error("DB Error (findById Ride):", error);
            throw error;
        }
    }

    /**
     * (★수정★) PostGIS: ST_AsGeoJSON + DB 컬럼명
     */
    static async findByUserId(userId) {
        try {
            const query = `
                SELECT
                    ride_id, user_id, pm_id,
                    ST_AsGeoJSON(start_loc) AS start_location,
                    ST_AsGeoJSON(end_loc) AS end_location,
                    start_time, end_time, distance, duration, fare, score
                FROM t_ride
                WHERE user_id = $1
            `;
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error("DB Error (findByUserId Ride):", error);
            throw error;
        }
    }

    /**
     * (★수정★) PostGIS: ST_MakePoint + DB 컬럼명(start_loc) + is_helmet
     */
    static async create(data) {
        try {
            // (★수정★) is_helmet 추가
            const { user_id, pm_id, start_time, start_loc, is_helmet } = data;

            if (!start_loc || start_loc.lat == null || start_loc.lng == null) {
                throw new Error("start_loc object {lat, lng} is required.");
            }

            const query = `
                INSERT INTO t_ride (user_id, pm_id, start_time, start_loc, is_helmet)
                VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6)
                    RETURNING ride_id, user_id, pm_id, ST_AsGeoJSON(start_loc) AS start_location, start_time
            `;

            const values = [
                user_id,
                pm_id,
                start_time,
                start_loc.lng, // $4
                start_loc.lat,  // $5
                is_helmet // $6
            ];

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("DB Error (create Ride):", error);
            throw error;
        }
    }

    /**
     * (★수정★) PostGIS: 주행 종료 전용 업데이트 함수 + DB 컬럼명
     */
    static async endRideUpdate(rideId, endData) {
        try {
            const { end_location_obj, end_time, duration, fare, score } = endData;

            if (!end_location_obj || end_location_obj.lat == null || end_location_obj.lng == null) {
                throw new Error("end_location_obj {lat, lng} is required.");
            }

            const endLocationGeo = `ST_SetSRID(ST_MakePoint(${end_location_obj.lng}, ${end_location_obj.lat}), 4326)::geography`;

            const query = `
                UPDATE t_ride
                SET
                    end_loc = ${endLocationGeo}, -- (★수정★) DB 컬럼명
                    end_time = $1,
                    duration = $2,
                    fare = $3,
                    score = $4,
                    distance = ST_Distance(start_loc, ${endLocationGeo}) / 1000.0 -- (★수정★) DB 컬럼명
                WHERE ride_id = $5
                    RETURNING 
          ride_id, 
          ST_AsGeoJSON(start_loc) AS start_location, 
          ST_AsGeoJSON(end_loc) AS end_location, 
          start_time, end_time, distance, duration, fare, score
            `;

            const values = [
                end_time,     // $1
                duration,     // $2
                fare,         // $3
                score,        // $4
                rideId        // $5
            ];

            const result = await db.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error("DB Error (endRideUpdate):", error);
            throw error;
        }
    }


    /**
     * (★수정★) 범용 update 함수 (DB 컬럼명 수정)
     */
    static async update(rideId, updateData) {
        try {
            const fields = Object.keys(updateData)
                .map((key, index) => `${key} = $${index + 1}`)
                .join(", ");
            const values = Object.values(updateData);

            // (★수정★) start_loc, end_loc 별칭(Alias) 사용
            const result = await db.query(
                `UPDATE t_ride SET ${fields} WHERE ride_id = $${
                        values.length + 1
                } RETURNING ride_id, ST_AsGeoJSON(start_loc) AS start_location, ST_AsGeoJSON(end_loc) AS end_location, fare, score`,
                [...values, rideId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error("DB Error (update Ride):", error);
            throw error;
        }
    }

    /**
     * (기존과 동일)
     */
    static async delete(rideId) {
        try {
            const result = await db.query("DELETE FROM t_ride WHERE ride_id = $1", [
                rideId,
            ]);
            return result.rowCount > 0;
        } catch (error) {
            console.error("DB Error (delete Ride):", error);
            throw error;
        }
    }

    /**
     * (★신규★) 현재 운행 중인(end_time = NULL) 모든 라이드 조회
     * (RealtimeView.vue 전용)
     */
    static async findActiveRidesAdmin() {
        try {
            const query = `
                SELECT
                    r.ride_id, r.user_id, r.pm_id, r.start_time,
                    k.battery,
                    ST_AsGeoJSON(k.location) AS location
                FROM t_ride r
                         -- (★핵심 수정★) r.pm_id (VARCHAR)를 BIGINT로 명시적 캐스팅하여 k.pm_id (BIGINT)와 JOIN
                         JOIN t_kickboard k ON r.pm_id = k.pm_id
                WHERE r.end_time IS NULL
                ORDER BY r.start_time DESC;
            `;
            const result = await db.query(query);
            return result.rows; // [{ ride_id, user_id, pm_id, start_time, battery, location(GeoJSON) }]
        } catch (error) {
            console.error("DB Error (findActiveRidesAdmin):", error);
            throw error;
        }
    }
}

module.exports = RideRepository;