// PM_back/src/services/stats.service.js

const StatsRepository = require("../repository/stats.repository");

/**
 * 통계 서비스
 */
class StatsService {
    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/kpis)
     * 대시보드 KPI 4종 조회
     */
    async getDashboardKpis(startDate, endDate) {
        const kpis = await StatsRepository.getDashboardKpis(startDate, endDate);

        return {
            totalUserCount: kpis.totalUserCount,
            totalRiskCount: kpis.totalRiskCount,
            helmetRate: parseFloat(kpis.helmetRate || 0).toFixed(1), // 소수점 1자리
            totalDistance: parseFloat(kpis.totalDistance || 0).toFixed(1) // 소수점 1자리
        };
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/monthly-safety-scores)
     * 월별 평균 안전 점수 (대시보드 차트용)
     */
    async getMonthlySafetyScores(startDate, endDate) {
        const dbData = await StatsRepository.getMonthlySafetyScores(
            startDate,
            endDate
        );

        // DB 데이터를 Chart.js 형식으로 변환
        const labels = dbData.map((d) => d.month);
        const data = dbData.map((d) => parseFloat(d.avgScore || 0).toFixed(1));

        return { labels, data };
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/hourly-risk)
     * 시간대별 총 위험 행동 (대시보드 차트용)
     */
    async getHourlyRisk(startDate, endDate) {
        const dbData = await StatsRepository.getHourlyRisk(startDate, endDate);

        // DB 데이터를 Chart.js 형식으로 변환
        // (0시~23시 배열을 만들고, DB 값으로 채우기)
        const hourlyData = new Array(24).fill(0);
        for (const row of dbData) {
            if (row.hour != null) {
                hourlyData[row.hour] = parseInt(row.riskCount);
            }
        }

        const labels = Array.from({ length: 24 }, (_, i) => `${i}시`);

        return { labels, data: hourlyData };
    }

    /**
     * v1.3 명세서 7번 (GET /api/admin/events)
     * 관리자용 이벤트 로그 조회 (페이징 및 검색)
     */
    async getEventLogs(filters) {
        // (참고) eventType === '전체' 인 경우, controller에서 null로 변환되어 넘어옴
        const { rows, totalCount } = await StatsRepository.findAndCountAllEvents(
            filters
        );

        // v1.3 명세서 응답 형식에 맞게 매핑 (DB 컬럼이 snake_case라고 가정)
        const logs = rows.map((log) => ({
            logId: log.log_id,
            timestamp: log.timestamp,
            type: log.type,
            detail: log.detail,
            relatedUserId: log.related_user_id, // snake_case -> camelCase
            relatedPmId: log.related_pm_id, // snake_case -> camelCase
        }));

        return { totalCount, logs };
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/safety-scores)
     * 안전 점수 분포 (통계 탭 차트용)
     */
    async getSafetyScoreDistribution(startDate, endDate) {
        const dbData = await StatsRepository.getSafetyScoreDistribution(
            startDate,
            endDate
        );

        // DB 데이터를 명세서 응답 형식으로 변환
        const distribution = {
            "100-90": parseInt(dbData.range_90_100 || 0),
            "89-80": parseInt(dbData.range_80_89 || 0),
            "79-70": parseInt(dbData.range_70_79 || 0),
            "69-60": parseInt(dbData.range_60_69 || 0),
            "59-0": parseInt(dbData.range_0_59 || 0),
        };

        return {
            averageScore: parseFloat(dbData.averageScore || 0).toFixed(1),
            userCount: parseInt(dbData.userCount || 0),
            distribution: distribution
        };
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/kpi-trends)
     * KPI 트렌드 (통계 탭 차트용)
     */
    async getKpiTrends(startDate, endDate, interval = 'daily') {
        // (날짜가 없으면 기본 30일)
        if (!endDate) {
            endDate = new Date().toISOString().split('T')[0];
        }
        if (!startDate) {
            const date = new Date(endDate);
            date.setDate(date.getDate() - 29);
            startDate = date.toISOString().split('T')[0];
        }

        const dbData = await StatsRepository.getKpiTrends(
            startDate,
            endDate,
            interval
        );

        // DB 데이터를 v1.3 명세서 형식으로 분리
        const labels = dbData.map(d => d.label);
        const datasets = {
            rideCounts: dbData.map(d => d.rideCounts),
            helmetRates: dbData.map(d => parseFloat(d.helmetRate || 0).toFixed(1)),
            riskCounts: dbData.map(d => d.riskCounts)
        };

        return { labels, datasets };
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/risk-types)
     * 위험 행동 유형별 통계 (파이 차트용)
     */
    async getRiskTypes(startDate, endDate) {
        const { rows, totalCount } = await StatsRepository.getRiskTypes(
            startDate,
            endDate
        );

        // DB 데이터를 명세서 응답 형식으로 변환 (백분율 계산)
        const data = rows.map((row) => {
            const count = parseInt(row.count || 0);
            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
            return {
                kpiName: row.kpi_name,
                count: count,
                percentage: parseFloat(percentage.toFixed(1)), // 소수점 1자리
            };
        });

        return { data }; // v1.3 명세서 응답: { data: [...] }
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/user-group-comparison)
     * 사용자 그룹별 비교 (바 차트용)
     */
    async getUserGroupComparison(startDate, endDate) {
        const dbData = await StatsRepository.getUserGroupComparison(
            startDate,
            endDate
        );

        // DB 데이터를 v1.3 명세서 응답 형식으로 변환
        const groups = dbData.map((row) => ({
            group: row.group,
            "안전점수": parseFloat(row.avgSafetyScore || 0).toFixed(1),
            "위험행동빈도": parseFloat(row.avgRiskCount || 0).toFixed(1)
        }));

        return { groups }; // v1.3 명세서 응답: { groups: [...] }
    }

    /**
     * (★건너뛴 기능★)
     * v1.3 명세서 6번 (GET /api/admin/stats/top-risk-regions)
     * @returns {Promise<object>}
     */
    async getTopRiskRegions(startDate, endDate) {
        const dbData = await StatsRepository.getTopRiskRegions(
            startDate,
            endDate
        );

        // DB 데이터를 v1.3 명세서 응답 형식으로 변환 (rank 추가)
        const regions = dbData.map((row, index) => ({
            rank: index + 1, // 순위
            regionName: row.regionName,
            count: parseInt(row.count || 0)
        }));

        return { regions }; // v1.3 명세서 응답: { regions: [...] }
    }

    /**
     * v1.3 명세서 (POST /api/admin/stats/rides/stats)
     * 점수 재계산
     * @param {string | null} userId (특정 유저만 재계산)
     * @returns {Promise<object>}
     */
    async recalculateStats(userId) {
        // (TODO: userId가 있으면 해당 유저만 재계산하는 쿼리 필요)
        if (userId) {
            console.warn("특정 사용자 재계산은 아직 구현되지 않았습니다.");
            // (임시) 전체 재계산 실행
        }

        console.log("전체 주행(ride) 점수 재계산 시작...");
        // 1. 주행 점수 먼저 재계산 (t_ride.score 업데이트)
        await StatsRepository.recalculateRideScores();

        console.log("전체 사용자(user) 안전 점수 재계산 시작...");
        // 2. 주행 점수 평균으로 사용자 안전 점수 재계산 (t_user.safety_score 업데이트)
        await StatsRepository.recalculateUserSafetyScores();

        return { message: "All scores recalculated successfully" };
    }

    /**
     * (★건너뛴 기능★)
     * v1.3 명세서 6번 (GET /api/admin/stats/regional-scores)
     * @returns {Promise<object>}
     */
    async getRegionalScores(startDate, endDate) {
        // (TODO: 'region_name' 컬럼이 필요하여 구현 건너뜀)
        return { regions: [] };
    }
}

module.exports = new StatsService();