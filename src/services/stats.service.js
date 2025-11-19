// PM_back/src/services/stats.service.js

const StatsRepository = require("../repository/stats.repository");
const KPIRepository = require("../repository/kpi.repository"); // (★중요★) KPI 데이터 조회용

class StatsService {
    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/kpis)
     * 대시보드 KPI 5종 조회
     */
    async getDashboardKpis(startDate, endDate) {
        const kpis = await StatsRepository.getDashboardKpis(null, null);
        return {
            totalUserCount: kpis.totalUserCount,
            totalRiskCount: kpis.totalRiskCount,
            helmetRate: parseFloat(kpis.helmetRate || 0).toFixed(1),
            totalDistance: parseFloat(kpis.totalDistance || 0).toFixed(1),
            totalRides: kpis.totalRides,
        };
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/monthly-safety-scores)
     * 월별 평균 안전 점수
     */
    async getMonthlySafetyScores(startDate, endDate) {
        const dbData = await StatsRepository.getMonthlySafetyScores(null, null);
        const labels = dbData.map((d) => d.month);
        const data = dbData.map((d) => parseFloat(d.avgScore || 0).toFixed(1));
        return { labels, data };
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/hourly-risk)
     * 시간대별 총 위험 행동
     */
    async getHourlyRisk(startDate, endDate) {
        const dbData = await StatsRepository.getHourlyRisk(null, null);
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
     * 관리자용 이벤트 로그 조회
     */
    async getEventLogs(filters) {
        const { rows, totalCount } = await StatsRepository.findAndCountAllEvents(filters);
        const logs = rows.map((log) => ({
            logId: log.log_id,
            timestamp: log.timestamp,
            type: log.type,
            detail: log.detail,
            relatedUserId: log.related_user_id,
            relatedPmId: log.related_pm_id,
        }));
        return { totalCount, logs };
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/safety-scores)
     * 안전 점수 분포
     */
    async getSafetyScoreDistribution(startDate, endDate) {
        const dbData = await StatsRepository.getSafetyScoreDistribution(null, null);
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
     * KPI 트렌드
     */
    async getKpiTrends(startDate, endDate, interval = 'daily') {
        if (!endDate) endDate = new Date().toISOString().split('T')[0];
        if (!startDate) {
            const date = new Date(endDate);
            date.setDate(date.getDate() - 29);
            startDate = date.toISOString().split('T')[0];
        }
        const dbData = await StatsRepository.getKpiTrends(startDate, endDate, interval);
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
     * 위험 행동 유형별 통계
     */
    async getRiskTypes(startDate, endDate) {
        const { rows, totalCount } = await StatsRepository.getRiskTypes(null, null);
        const data = rows.map((row) => {
            const count = parseInt(row.count || 0);
            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
            return {
                kpiName: row.kpi_name,
                count: count,
                percentage: parseFloat(percentage.toFixed(1)),
            };
        });
        return { data };
    }

    /**
     * v1.3 명세서 6번 (GET /api/admin/stats/user-group-comparison)
     * 사용자 그룹별 비교
     */
    async getUserGroupComparison(startDate, endDate) {
        const dbData = await StatsRepository.getUserGroupComparison(null, null);
        const groups = dbData.map((row) => ({
            group: row.group,
            "평균 안전점수": parseFloat(row.avgSafetyScore || 0).toFixed(1)
        }));
        return { groups };
    }

    /**
     * Top 5 위험 지역 (더미 반환)
     */
    async getTopRiskRegions(startDate, endDate) {
        const dbData = await StatsRepository.getTopRiskRegions(startDate, endDate);
        const regions = dbData.map((row, index) => ({
            rank: index + 1,
            regionName: row.regionName,
            count: parseInt(row.count || 0)
        }));
        return { regions };
    }

    /**
     * 점수 재계산
     */
    async recalculateStats(userId) {
        console.log("전체 주행(ride) 점수 재계산 시작...");
        await StatsRepository.recalculateRideScores();
        console.log("전체 사용자(user) 안전 점수 재계산 시작...");
        await StatsRepository.recalculateUserSafetyScores();
        return { message: "All scores recalculated successfully" };
    }

    /**
     * 지역별 점수 (더미 반환)
     */
    async getRegionalScores(startDate, endDate) {
        return { regions: [] };
    }

    /**
     * 오늘 가장 많이 운행한 사용자 Top 5
     */
    async getTopRidersToday() {
        const users = await StatsRepository.findTopRidersToday(5);
        return users.map(user => ({
            userId: user.user_id,
            nickname: user.nickname,
            rideCount: parseInt(user.rideCount || 0)
        }));
    }

    /**
     * (★수정됨★) 사고 시 KPI 빈도 분석 (바 차트용)
     * 정렬 기준: KPI ID 오름차순 (1. 급출발 ~ 6. 헬멧 미착용)
     */
    async getAccidentKpiStats() {
        // KPIRepository에 이미 구현된 통계 쿼리 재사용
        const rows = await KPIRepository.getKpiStats();

        // (★수정★) KPI ID 순서대로 정렬
        const sorted = rows.sort((a, b) => a.kpi_id - b.kpi_id);

        return {
            labels: sorted.map(row => row.kpi_name),
            data: sorted.map(row => parseInt(row.accident_count))
        };
    }

    /**
     * (★신규★) 사고 발생률 추이 (라인 차트용)
     */
    async getAccidentTrend(startDate, endDate) {
        // 날짜 없으면 최근 30일 자동 설정
        if (!endDate) endDate = new Date().toISOString().split('T')[0];
        if (!startDate) {
            const d = new Date(endDate);
            d.setDate(d.getDate() - 29);
            startDate = d.toISOString().split('T')[0];
        }

        const rows = await StatsRepository.getAccidentTrend(startDate, endDate);

        const labels = rows.map(r => r.date);
        const rates = rows.map(r => {
            const total = parseInt(r.totalRides);
            const accident = parseInt(r.accidentCount);
            return total > 0 ? ((accident / total) * 100).toFixed(2) : 0;
        });

        return { labels, data: rates };
    }
}

module.exports = new StatsService();