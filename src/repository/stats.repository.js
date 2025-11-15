// PM_back/src/repository/stats.repository.js

const db = require("../config/db");

/**
 * 통계 Repository
 * (대시보드, 통계 탭의 복잡한 쿼리 담당)
 */
class StatsRepository {

    // ( ... 기존 getDashboardKpis ~ recalculateUserSafetyScores 함수들 ... )

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/kpis)
     * 대시보드 KPI 4종 조회
     */
    static async getDashboardKpis(startDate, endDate) {
        // 1. 누적 이용자 수 (T_USER)
        const userQuery = db.query(
            `SELECT COUNT(user_id) AS "totalUserCount" FROM t_user WHERE role = 'user'`
        );

        // 2. 누적 발생 위험 행동 수 (T_RISK_LOG)
        const riskQuery = db.query(
            `SELECT COUNT(log_id) AS "totalRiskCount" FROM t_risk_log`
        );

        // 3. 누적 운행거리 합계 (T_RIDE)
        const distanceQuery = db.query(
            `SELECT SUM(distance) AS "totalDistance" FROM t_ride`
        );

        // 4. 안전모 착용률 (T_RISK_LOG)
        // (가정: T_RISK_KPI에 'kpi_helmet_off' ID가 있고, T_RIDE에서 총 주행 횟수를 가져옴)
        const helmetQuery = db.query(
            `SELECT
                 (
                     1.0 - (
                         (SELECT COUNT(log_id)::float FROM t_risk_log WHERE kpi_id = 1)
                             /
                         NULLIF((SELECT COUNT(ride_id)::float FROM t_ride WHERE distance > 0), 0.0)
                         )
                     ) * 100 AS "helmetRate"`
        );

        // 4개 쿼리를 동시에 실행
        try {
            const [userResult, riskResult, distanceResult, helmetResult] =
                await Promise.all([userQuery, riskQuery, distanceQuery, helmetQuery]);

            return {
                totalUserCount: parseInt(userResult.rows[0]?.totalUserCount || 0),
                totalRiskCount: parseInt(riskResult.rows[0]?.totalRiskCount || 0),
                totalDistance: parseFloat(distanceResult.rows[0]?.totalDistance || 0),
                helmetRate: parseFloat(helmetResult.rows[0]?.helmetRate || 0),
            };
        } catch (error) {
            console.error("DB Error (getDashboardKpis):", error);
            throw error;
        }
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/monthly-safety-scores)
     * 월별 평균 안전 점수 (대시보드 차트용)
     */
    static async getMonthlySafetyScores(startDate, endDate) {
        try {
            // (참고: T_RIDE의 score는 주행 완료 시점에 계산된다고 가정)
            const query = `
                SELECT
                    to_char(start_time, 'YYYY-MM') AS "month",
                    COALESCE(AVG(score), 0) AS "avgScore"
                FROM t_ride
                WHERE start_time IS NOT NULL AND score IS NOT NULL
                GROUP BY "month"
                ORDER BY "month";
            `;
            // (TODO: startDate, endDate 쿼리에 반영)
            const result = await db.query(query);
            return result.rows; // [{ month: '2025-10', avgScore: 85.5 }, ...]
        } catch (error) {
            console.error("DB Error (getMonthlySafetyScores):", error);
            throw error;
        }
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/hourly-risk)
     * 시간대별 총 위험 행동 (대시보드 차트용)
     */
    static async getHourlyRisk(startDate, endDate) {
        try {
            const query = `
                SELECT
                    EXTRACT(HOUR FROM "timestamp") AS "hour",
                    COUNT(log_id) AS "riskCount"
                FROM t_risk_log
                WHERE "timestamp" IS NOT NULL
                GROUP BY "hour"
                ORDER BY "hour";
            `;
            // (TODO: startDate, endDate 쿼리에 반영)
            const result = await db.query(query);
            return result.rows; // [{ hour: 9, riskCount: 15 }, { hour: 14, riskCount: 5 }]
        } catch (error) {
            console.error("DB Error (getHourlyRisk):", error);
            throw error;
        }
    }

    /**
     * v1.3 명세서 7번 (GET /api/admin/events)
     * 관리자용 이벤트 로그 검색 및 페이징
     * (가정: 't_event_log' 테이블 사용)
     */
    static async findAndCountAllEvents(filters) {
        const {
            page = 1,
            size = 10,
            startDate,
            endDate,
            eventType,
        } = filters;

        // page와 size를 숫자로 변환
        const limitNum = parseInt(size, 10);
        const pageNum = parseInt(page, 10);
        const offset = (pageNum - 1) * limitNum;

        // (가정: t_event_log 스키마) log_id, "timestamp", type, detail, related_user_id, related_pm_id
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
            const countResult = await db.query(
                countQuery,
                values.slice(0, values.length - 2) // LIMIT, OFFSET 값 제외
            );

            return {
                rows: result.rows,
                totalCount: parseInt(countResult.rows[0].count, 10),
            };
        } catch (error) {
            // (★중요★) 't_event_log' 테이블이 존재하지 않으면 여기서 500 오류 발생
            console.error("DB Error (findAndCountAllEvents):", error);
            // (임시) 테이블이 없을 경우, 빈 배열을 반환하여 서버 다운 방지
            if (error.code === '42P01') { // 'relation ... does not exist'
                console.warn("경고: 't_event_log' 테이블이 DB에 존재하지 않습니다.");
                return { rows: [], totalCount: 0 };
            }
            throw error;
        }
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/safety-scores)
     * 안전 점수 분포 (통계 탭 차트용)
     */
    static async getSafetyScoreDistribution(startDate, endDate) {
        try {
            // (참고: T_USER의 safety_score를 구간별로 집계)
            // (TODO: startDate, endDate 필터는 T_RIDE와 JOIN해야 하므로 이 예제에서는 생략)

            const query = `
                SELECT
                    SUM(CASE WHEN safety_score >= 90 THEN 1 ELSE 0 END) AS "range_90_100",
                    SUM(CASE WHEN safety_score >= 80 AND safety_score < 90 THEN 1 ELSE 0 END) AS "range_80_89",
                    SUM(CASE WHEN safety_score >= 70 AND safety_score < 80 THEN 1 ELSE 0 END) AS "range_70_79",
                    SUM(CASE WHEN safety_score >= 60 AND safety_score < 70 THEN 1 ELSE 0 END) AS "range_60_69",
                    SUM(CASE WHEN safety_score < 60 THEN 1 ELSE 0 END) AS "range_0_59",
                    AVG(safety_score) AS "averageScore",
                    COUNT(user_id) AS "userCount"
                FROM t_user
                WHERE role = 'user';
            `;
            const result = await db.query(query);
            return result.rows[0]; // { range_90_100: "10", ..., averageScore: "88.5", userCount: "120" }
        } catch (error) {
            console.error("DB Error (getSafetyScoreDistribution):", error);
            throw error;
        }
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/kpi-trends)
     * @param {string} startDate
     * @param {string} endDate
     * @param {string} interval ('daily' or 'monthly')
     */
    static async getKpiTrends(startDate, endDate, interval) {
        // (참고: 이 쿼리는 PostgreSQL의 generate_series를 사용합니다)
        // (interval이 'monthly'이면 'YYYY-MM', 'daily'이면 'YYYY-MM-DD')
        const dateFormat = interval === 'monthly' ? 'YYYY-MM' : 'YYYY-MM-DD';
        const intervalUnit = interval === 'monthly' ? '1 month' : '1 day';

        try {
            const query = `
        -- 1. 쿼리 범위 내의 모든 날짜/월 생성
        WITH date_series AS (
          SELECT g.day::date
          FROM generate_series(
              $1::date, 
              $2::date, 
              $3::interval
          ) g(day)
        ),
        -- 2. 날짜/월별 주행 횟수 집계
        daily_rides AS (
          SELECT
              to_char(start_time, $4) AS day_label,
              COUNT(ride_id) AS "rideCounts"
          FROM t_ride
          WHERE start_time BETWEEN $1 AND $2
          GROUP BY day_label
        ),
        -- 3. 날짜/월별 위험 행동 횟수 집계
        daily_risks AS (
          SELECT
              to_char("timestamp", $4) AS day_label,
              COUNT(log_id) AS "riskCounts"
          FROM t_risk_log
          WHERE "timestamp" BETWEEN $1 AND $2
          GROUP BY day_label
        ),
        -- 4. 날짜/월별 헬멧 미착용 횟수 집계 (kpi_id = 1 가정)
        daily_helmet_off AS (
          SELECT
              to_char("timestamp", $4) AS day_label,
              COUNT(log_id) AS "helmetOffCounts"
          FROM t_risk_log
          WHERE kpi_id = 1 AND "timestamp" BETWEEN $1 AND $2
          GROUP BY day_label
        )
        -- 5. 모든 데이터를 날짜/월 기준으로 JOIN
        SELECT
            to_char(ds.day, $4) AS "label",
            COALESCE(dr."rideCounts", 0)::int AS "rideCounts",
            COALESCE(drs."riskCounts", 0)::int AS "riskCounts",
            -- 헬멧 착용률: (1 - (미착용 / 총 주행)) * 100
            (
                1.0 - (
                    COALESCE(dho."helmetOffCounts", 0)::float 
                    / 
                    NULLIF(COALESCE(dr."rideCounts", 0)::float, 0.0) -- 0으로 나누기 방지
                )
            ) * 100 AS "helmetRate"
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
     * v1.3 명세서 6번 (GET /api/admin/stats/risk-types)
     * 위험 행동 유형별 통계 (파이 차트용)
     */
    static async getRiskTypes(startDate, endDate) {
        // (TODO: startDate, endDate 필터를 쿼리에 반영)
        try {
            // 1. kpi_id별 건수 집계 (kpi_name을 위해 T_RISK_KPI와 JOIN)
            const query = `
                SELECT
                    k.kpi_name,
                    COUNT(rl.log_id) AS "count"
                FROM t_risk_log rl
                         JOIN t_risk_kpi k ON rl.kpi_id = k.kpi_id
                -- WHERE rl."timestamp" BETWEEN $1 AND $2 -- (필요 시 날짜 필터)
                GROUP BY k.kpi_name
                ORDER BY "count" DESC;
            `;

            // 2. 전체 위험 건수 (백분율 계산용)
            const totalCountQuery = `
                SELECT COUNT(log_id) AS "totalCount"
                FROM t_risk_log
                -- WHERE "timestamp" BETWEEN $1 AND $2 -- (필요 시 날짜 필터)
            `;

            const [result, totalResult] = await Promise.all([
                db.query(query /*, [startDate, endDate]*/),
                db.query(totalCountQuery /*, [startDate, endDate]*/),
            ]);

            return {
                rows: result.rows, // [{ kpi_name: '헬멧 미착용', count: '50' }, ...]
                totalCount: parseInt(totalResult.rows[0]?.totalCount || 0),
            };
        } catch (error) {
            console.error("DB Error (getRiskTypes):", error);
            throw error;
        }
    }

    /**
     * (★수정★) v1.3 명세서 6번 (GET /api/admin/stats/user-group-comparison)
     * 사용자 그룹별 비교 (바 차트용) - '횟수' 기준으로 변경
     */
    static async getUserGroupComparison(startDate, endDate) {
        // (TODO: startDate, endDate 필터를 쿼리에 반영)
        try {
            const query = `
                -- 1. 사용자별 총 주행 횟수 계산
                WITH user_ride_counts AS (
                    SELECT
                        user_id,
                        COUNT(ride_id) AS ride_count
                    FROM t_ride
                    -- WHERE start_time BETWEEN $1 AND $2 -- (필요 시 날짜 필터)
                    GROUP BY user_id
                ),
                -- 2. 주행 횟수를 기준으로 그룹핑하고, t_user와 조인하여 안전점수 가져오기
                user_groups AS (
                    SELECT
                        u.user_id,
                        u.safety_score,
                        COALESCE(urc.ride_count, 0) AS ride_count,
                        CASE
                            WHEN COALESCE(urc.ride_count, 0) < 10 THEN '신규 사용자' -- (10회 미만)
                            WHEN COALESCE(urc.ride_count, 0) < 100 THEN '10회 이상' -- (10회 ~ 99회)
                            ELSE '100회 이상' -- (100회 이상)
                        END AS "group_name"
                    FROM t_user u
                    LEFT JOIN user_ride_counts urc ON u.user_id = urc.user_id
                    WHERE u.role = 'user'
                )
                -- 3. 그룹별 평균 안전점수 계산
                SELECT
                    ug.group_name AS "group",
                    COALESCE(AVG(ug.safety_score), 0) AS "avgSafetyScore"
                FROM user_groups ug
                GROUP BY ug.group_name
                -- 4. 그룹 순서 정렬
                ORDER BY
                    CASE
                        WHEN ug.group_name = '신규 사용자' THEN 1
                        WHEN ug.group_name = '10회 이상' THEN 2
                        ELSE 3
                    END;
            `;

            const result = await db.query(query /*, [startDate, endDate]*/);
            return result.rows; // [{ group: '신규 사용자', avgSafetyScore: '75.0' }, ...]
        } catch (error) {
            console.error("DB Error (getUserGroupComparison):", error);
            throw error;
        }
    }

    /**
     * (★수정★ - 더미 데이터로 대체됨)
     * v1.3 명세서 6번 (GET /api/admin/stats/top-risk-regions)
     * Top 5 위험 지역 (테이블용)
     */
    static async getTopRiskRegions(startDate, endDate) {
        // (TODO: t_risk_log에 'region_name' 컬럼이 없어 임시로 비활성화)
        try {
            // const query = ` ... `
            // const result = await db.query(query /*, [startDate, endDate]*/);
            return []; // ⬅️ 즉시 빈 배열 반환
        } catch (error) {
            console.error("DB Error (getTopRiskRegions - 비활성화됨):", error);
            return [];
        }
    }

    /**
     * (★신규 추가★ - 10단계: 1/2)
     * POST /api/admin/stats/rides/stats
     * 1. 모든 '주행(ride)' 점수 재계산
     * (t_risk_log와 t_risk_kpi를 JOIN하여 감점 합계 계산 후 t_ride.score 업데이트)
     */
    static async recalculateRideScores() {
        try {
            // (가정: t_risk_kpi에 'weight' 컬럼이 감점 점수)
            // (사용자 요청: 0점 미만 방지)
            const query = `
                WITH ride_deductions AS (
                    -- 1. 주행(ride_id)별 총 감점(deduction) 계산
                    SELECT
                        rl.ride_id,
                        SUM(k.weight) AS total_deduction
                    FROM t_risk_log rl
                             JOIN t_risk_kpi k ON rl.kpi_id = k.kpi_id
                    GROUP BY rl.ride_id
                )
                -- 2. t_ride 테이블의 score 업데이트 (100 - 감점)
                UPDATE t_ride
                SET
                    /* (★개선★) 0점 미만으로 내려가지 않도록 GREATEST 사용 */
                    score = GREATEST(0, 100 - COALESCE(rd.total_deduction, 0))
                    FROM ride_deductions rd
                WHERE t_ride.ride_id = rd.ride_id;

                -- (참고) 위험 로그가 없는 주행은 100점으로 업데이트
                UPDATE t_ride
                SET score = 100
                WHERE ride_id NOT IN (SELECT ride_id FROM ride_deductions);
            `;
            await db.query(query);
            return true;
        } catch (error) {
            console.error("DB Error (recalculateRideScores):", error);
            throw error;
        }
    }

    /**
     * (★신규 추가★ - 10단계: 2/2)
     * POST /api/admin/stats/rides/stats
     * 2. 모든 '사용자(user)' 안전 점수 재계산
     * (t_ride에 업데이트된 score의 평균을 t_user.safety_score에 업데이트)
     */
    static async recalculateUserSafetyScores() {
        try {
            const query = `
                WITH user_avg_scores AS (
                    -- 1. 사용자(user_id)별 평균 주행 점수 계산
                    SELECT
                        user_id,
                        AVG(score) AS "avgScore"
                    FROM t_ride
                    WHERE score IS NOT NULL
                    GROUP BY user_id
                )
                -- 2. t_user 테이블의 safety_score 업데이트
                UPDATE t_user
                SET
                    safety_score = uas."avgScore"
                    FROM user_avg_scores uas
                WHERE t_user.user_id = uas.user_id
                  AND t_user.role = 'user';

                -- (참고) 주행 기록이 없는 사용자는 100점으로 업데이트
                UPDATE t_user
                SET safety_score = 100
                WHERE role = 'user'
                  AND user_id NOT IN (SELECT user_id FROM user_avg_scores);
            `;
            await db.query(query);
            return true;
        } catch (error) {
            console.error("DB Error (recalculateUserSafetyScores):", error);
            throw error;
        }
    }

    /**
     * (★신규★)
     * 오늘 가장 많이 운행한 사용자 Top 5 조회 (대시보드용)
     * @param {number} limit
     * @returns {Promise<Array>}
     */
    static async findTopRidersToday(limit = 2) {
        try {
            const query = `
                SELECT
                    r.user_id,
                    u.nickname,
                    COUNT(r.ride_id) AS "rideCount"
                FROM t_ride r
                         JOIN t_user u ON r.user_id = u.user_id
                WHERE r.start_time >= CURRENT_DATE
                  AND r.start_time < CURRENT_DATE + INTERVAL '1 day'
                  AND u.role = 'user'
                GROUP BY r.user_id, u.nickname
                ORDER BY "rideCount" DESC
                    LIMIT $1;
            `;
            const result = await db.query(query, [limit]);
            return result.rows; // [{ user_id, nickname, rideCount }]
        } catch (error) {
            console.error("DB Error (findTopRidersToday):", error);
            throw error;
        }
    }

} // (Class 닫는 괄호)

module.exports = StatsRepository;