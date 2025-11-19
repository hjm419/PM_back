// PM_back/src/repository/stats.repository.js

const db = require("../config/db");

/**
 * 통계 Repository
 */
class StatsRepository {

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/kpis)
     * KPI 5종 조회
     */
    static async getDashboardKpis(startDate, endDate) {
        const userQuery = db.query(`SELECT COUNT(user_id) AS "totalUserCount" FROM t_user WHERE role = 'user'`);
        const riskQuery = db.query(`SELECT COUNT(log_id) AS "totalRiskCount" FROM t_risk_log`);
        const distanceQuery = db.query(`SELECT SUM(distance) AS "totalDistance" FROM t_ride`);
        const helmetQuery = db.query(
            `SELECT (1.0 - ((SELECT COUNT(log_id)::float FROM t_risk_log WHERE kpi_id = 1) / NULLIF((SELECT COUNT(ride_id)::float FROM t_ride WHERE distance > 0), 0.0))) * 100 AS "helmetRate"`
        );
        const rideCountQuery = db.query(`SELECT COUNT(ride_id) AS "totalRides" FROM t_ride`);

        try {
            const [userResult, riskResult, distanceResult, helmetResult, rideCountResult] =
                await Promise.all([userQuery, riskQuery, distanceQuery, helmetQuery, rideCountQuery]);

            return {
                totalUserCount: parseInt(userResult.rows[0]?.totalUserCount || 0),
                totalRiskCount: parseInt(riskResult.rows[0]?.totalRiskCount || 0),
                totalDistance: parseFloat(distanceResult.rows[0]?.totalDistance || 0),
                helmetRate: parseFloat(helmetResult.rows[0]?.helmetRate || 0),
                totalRides: parseInt(rideCountResult.rows[0]?.totalRides || 0),
            };
        } catch (error) {
            console.error("DB Error (getDashboardKpis):", error);
            throw error;
        }
    }

    /**
     * 월별 평균 안전 점수
     */
    static async getMonthlySafetyScores(startDate, endDate) {
        try {
            const query = `
                SELECT to_char(start_time, 'YYYY-MM') AS "month", COALESCE(AVG(score), 0) AS "avgScore"
                FROM t_ride
                WHERE start_time IS NOT NULL AND score IS NOT NULL
                GROUP BY "month" ORDER BY "month";
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error("DB Error (getMonthlySafetyScores):", error);
            throw error;
        }
    }

    /**
     * 시간대별 총 위험 행동
     */
    static async getHourlyRisk(startDate, endDate) {
        try {
            const query = `
                SELECT EXTRACT(HOUR FROM "timestamp") AS "hour", COUNT(log_id) AS "riskCount"
                FROM t_risk_log
                WHERE "timestamp" IS NOT NULL
                GROUP BY "hour" ORDER BY "hour";
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error("DB Error (getHourlyRisk):", error);
            throw error;
        }
    }

    /**
     * 이벤트 로그 검색 및 페이징
     */
    static async findAndCountAllEvents(filters) {
        const { page = 1, size = 10, startDate, endDate, eventType } = filters;
        const limitNum = parseInt(size, 10);
        const pageNum = parseInt(page, 10);
        const offset = (pageNum - 1) * limitNum;

        let query = `SELECT log_id, "timestamp", type, detail, related_user_id, related_pm_id FROM t_event_log`;
        let countQuery = `SELECT COUNT(log_id) FROM t_event_log`;

        const conditions = [];
        const values = [];
        let valueIndex = 1;

        if (eventType) {
            conditions.push(`type = $${valueIndex++}`);
            values.push(eventType);
        }
        if (startDate) {
            conditions.push(`"timestamp" >= $${valueIndex++}`);
            values.push(startDate);
        }
        if (endDate) {
            conditions.push(`"timestamp" <= $${valueIndex++}`);
            values.push(endDate + " 23:59:59");
        }

        if (conditions.length > 0) {
            const whereClause = ` WHERE ${conditions.join(" AND ")}`;
            query += whereClause;
            countQuery += whereClause;
        }

        query += ` ORDER BY "timestamp" DESC LIMIT $${valueIndex++} OFFSET $${valueIndex++}`;
        values.push(limitNum, offset);

        try {
            const result = await db.query(query, values);
            const countResult = await db.query(countQuery, values.slice(0, values.length - 2));

            return {
                rows: result.rows,
                totalCount: parseInt(countResult.rows[0].count, 10),
            };
        } catch (error) {
            console.error("DB Error (findAndCountAllEvents):", error);
            if (error.code === '42P01') return { rows: [], totalCount: 0 };
            throw error;
        }
    }

    /**
     * 안전 점수 분포
     */
    static async getSafetyScoreDistribution(startDate, endDate) {
        try {
            const query = `
                SELECT
                    SUM(CASE WHEN u.safety_score >= 90 THEN 1 ELSE 0 END) AS "range_90_100",
                    SUM(CASE WHEN u.safety_score >= 80 AND u.safety_score < 90 THEN 1 ELSE 0 END) AS "range_80_89",
                    SUM(CASE WHEN u.safety_score >= 70 AND u.safety_score < 80 THEN 1 ELSE 0 END) AS "range_70_79",
                    SUM(CASE WHEN u.safety_score >= 60 AND u.safety_score < 70 THEN 1 ELSE 0 END) AS "range_60_69",
                    SUM(CASE WHEN u.safety_score < 60 THEN 1 ELSE 0 END) AS "range_0_59",
                    AVG(u.safety_score) AS "averageScore",
                    COUNT(DISTINCT u.user_id) AS "userCount"
                FROM t_user u WHERE u.role = 'user';
            `;
            const result = await db.query(query);
            return result.rows[0];
        } catch (error) {
            console.error("DB Error (getSafetyScoreDistribution):", error);
            throw error;
        }
    }

    /**
     * KPI 트렌드
     */
    static async getKpiTrends(startDate, endDate, interval) {
        const dateFormat = interval === 'monthly' ? 'YYYY-MM' : 'YYYY-MM-DD';
        const intervalUnit = interval === 'monthly' ? '1 month' : '1 day';
        try {
            const query = `
                WITH date_series AS (
                    SELECT g.day::date FROM generate_series($1::date, $2::date, $3::interval) g(day)
                ),
                     daily_rides AS (
                         SELECT to_char(start_time, $4) AS day_label, COUNT(ride_id) AS "rideCounts"
                         FROM t_ride WHERE start_time BETWEEN $1 AND $2 GROUP BY day_label
                     ),
                     daily_risks AS (
                         SELECT to_char("timestamp", $4) AS day_label, COUNT(log_id) AS "riskCounts"
                         FROM t_risk_log WHERE "timestamp" BETWEEN $1 AND $2 GROUP BY day_label
                     ),
                     daily_helmet_off AS (
                         SELECT to_char("timestamp", $4) AS day_label, COUNT(log_id) AS "helmetOffCounts"
                         FROM t_risk_log WHERE kpi_id = 1 AND "timestamp" BETWEEN $1 AND $2 GROUP BY day_label
                     )
                SELECT
                    to_char(ds.day, $4) AS "label",
                    COALESCE(dr."rideCounts", 0)::int AS "rideCounts",
                    COALESCE(drs."riskCounts", 0)::int AS "riskCounts",
                    (1.0 - (COALESCE(dho."helmetOffCounts", 0)::float / NULLIF(COALESCE(dr."rideCounts", 0)::float, 0.0))) * 100 AS "helmetRate"
                FROM date_series ds
                         LEFT JOIN daily_rides dr ON to_char(ds.day, $4) = dr.day_label
                         LEFT JOIN daily_risks drs ON to_char(ds.day, $4) = drs.day_label
                         LEFT JOIN daily_helmet_off dho ON to_char(ds.day, $4) = dho.day_label
                ORDER BY ds.day;
            `;
            const result = await db.query(query, [startDate, endDate, intervalUnit, dateFormat]);
            return result.rows;
        } catch (error) {
            console.error("DB Error (getKpiTrends):", error);
            throw error;
        }
    }

    /**
     * 위험 행동 유형별 통계
     */
    static async getRiskTypes(startDate, endDate) {
        try {
            const query = `
                SELECT k.kpi_name, COUNT(rl.log_id) AS "count"
                FROM t_risk_log rl JOIN t_risk_kpi k ON rl.kpi_id = k.kpi_id
                GROUP BY k.kpi_name ORDER BY "count" DESC;
            `;
            const totalCountQuery = `SELECT COUNT(log_id) AS "totalCount" FROM t_risk_log`;
            const [result, totalResult] = await Promise.all([db.query(query), db.query(totalCountQuery)]);
            return { rows: result.rows, totalCount: parseInt(totalResult.rows[0]?.totalCount || 0) };
        } catch (error) {
            console.error("DB Error (getRiskTypes):", error);
            throw error;
        }
    }

    /**
     * 사용자 그룹별 비교
     */
    static async getUserGroupComparison(startDate, endDate) {
        try {
            const query = `
                WITH user_ride_counts AS (
                    SELECT user_id, COUNT(ride_id) AS ride_count FROM t_ride GROUP BY user_id
                ),
                     user_groups AS (
                         SELECT u.user_id, u.safety_score, COALESCE(urc.ride_count, 0) AS ride_count,
                                CASE
                                    WHEN COALESCE(urc.ride_count, 0) < 10 THEN '신규 사용자'
                                    WHEN COALESCE(urc.ride_count, 0) < 100 THEN '10회 이상'
                                    ELSE '100회 이상'
                                    END AS "group_name"
                         FROM t_user u LEFT JOIN user_ride_counts urc ON u.user_id = urc.user_id
                         WHERE u.role = 'user'
                     )
                SELECT ug.group_name AS "group", COALESCE(AVG(ug.safety_score), 0) AS "avgSafetyScore"
                FROM user_groups ug GROUP BY ug.group_name
                ORDER BY CASE WHEN ug.group_name = '신규 사용자' THEN 1 WHEN ug.group_name = '10회 이상' THEN 2 ELSE 3 END;
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error("DB Error (getUserGroupComparison):", error);
            throw error;
        }
    }

    /**
     * (★신규★) 사고 발생률 추이 조회 (최근 30일)
     */
    static async getAccidentTrend(startDate, endDate) {
        try {
            const query = `
                WITH date_series AS (
                    SELECT generate_series($1::date, $2::date, '1 day')::date AS day
                ),
                daily_stats AS (
                    SELECT DATE(start_time) AS day, COUNT(*) AS total_rides,
                    COUNT(CASE WHEN accident = true THEN 1 END) AS accident_count
                    FROM t_ride WHERE start_time >= $1 AND start_time <= $2
                    GROUP BY DATE(start_time)
                )
                SELECT to_char(ds.day, 'YYYY-MM-DD') AS "date",
                    COALESCE(st.total_rides, 0) AS "totalRides",
                    COALESCE(st.accident_count, 0) AS "accidentCount"
                FROM date_series ds LEFT JOIN daily_stats st ON ds.day = st.day
                ORDER BY ds.day;
            `;
            const result = await db.query(query, [startDate, endDate]);
            return result.rows;
        } catch (error) {
            console.error("DB Error (getAccidentTrend):", error);
            throw error;
        }
    }

    /**
     * (기존) Top 5 위험 지역 - 더미 데이터 반환
     */
    static async getTopRiskRegions(startDate, endDate) {
        return []; // 비활성화
    }

    /**
     * 주행 점수 재계산
     */
    static async recalculateRideScores() {
        try {
            const query = `
                WITH ride_deductions AS (
                    SELECT rl.ride_id, SUM(k.weight) AS total_deduction
                    FROM t_risk_log rl JOIN t_risk_kpi k ON rl.kpi_id = k.kpi_id
                    GROUP BY rl.ride_id
                )
                UPDATE t_ride SET score = GREATEST(0, 100 - COALESCE(rd.total_deduction, 0))
                    FROM ride_deductions rd WHERE t_ride.ride_id = rd.ride_id;
                UPDATE t_ride SET score = 100 WHERE ride_id NOT IN (SELECT ride_id FROM ride_deductions);
            `;
            await db.query(query);
            return true;
        } catch (error) {
            console.error("DB Error (recalculateRideScores):", error);
            throw error;
        }
    }

    /**
     * 유저 점수 재계산
     */
    static async recalculateUserSafetyScores() {
        try {
            const query = `
                WITH user_avg_scores AS (
                    SELECT user_id, AVG(score) AS "avgScore" FROM t_ride WHERE score IS NOT NULL GROUP BY user_id
                )
                UPDATE t_user SET safety_score = uas."avgScore" FROM user_avg_scores uas
                WHERE t_user.user_id = uas.user_id AND t_user.role = 'user';
                UPDATE t_user SET safety_score = 100 WHERE role = 'user' AND user_id NOT IN (SELECT user_id FROM user_avg_scores);
            `;
            await db.query(query);
            return true;
        } catch (error) {
            console.error("DB Error (recalculateUserSafetyScores):", error);
            throw error;
        }
    }

    /**
     * 오늘의 Top Rider
     */
    static async findTopRidersToday(limit = 5) {
        try {
            const query = `
                SELECT r.user_id, u.nickname, COUNT(r.ride_id) AS "rideCount"
                FROM t_ride r JOIN t_user u ON r.user_id = u.user_id
                WHERE r.start_time >= CURRENT_DATE AND r.start_time < CURRENT_DATE + INTERVAL '1 day' AND u.role = 'user'
                GROUP BY r.user_id, u.nickname ORDER BY "rideCount" DESC LIMIT $1;
            `;
            const result = await db.query(query, [limit]);
            return result.rows;
        } catch (error) {
            console.error("DB Error (findTopRidersToday):", error);
            throw error;
        }
    }
}

module.exports = StatsRepository;