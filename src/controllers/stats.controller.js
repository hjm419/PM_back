// PM_back/src/controllers/stats.controller.js

const statsService = require("../services/stats.service");
const apiResponse = require("../utils/apiResponse");

/**
 * GET /api/admin/stats/rides-logs
 * (v1.3 명세서에서 제거됨. /api/admin/rides/{rideId}/risks 로 대체)
 */
const getRiskLogs = async (req, res, next) => {
    try {
        // TODO: 위험 로그 분석 조회 구현 (현재 사용되지 않음)
        res.status(200).json(apiResponse.success([], "Risk logs retrieved"));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/stats/safety-scores (v1.3 명세서 경로)
 * 안전 점수 통계 조회
 */
const getSafetyScores = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        // (★수정★) TODO -> statsService 호출
        const data = await statsService.getSafetyScoreDistribution(startDate, endDate);

        res.status(200).json(apiResponse.success(data, "Safety scores retrieved"));
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/stats/rides/stats
 * 전체/특정 유저 점수 재계산
 */
const recalculateStats = async (req, res, next) => {
    try {
        const { userId } = req.body;

        // (★수정★) TODO -> statsService 호출
        const result = await statsService.recalculateStats(userId);

        res.status(200).json(apiResponse.success(result, "Stats recalculated"));
    } catch (error) {
        next(error);
    }
};

// --- (★이하 v1.3 명세서 신규 함수들★) ---

// v1.3 명세서 7번 (GET /api/admin/events)
const getEventLogs = async (req, res, next) => {
    try {
        // (★수정★) v1.3 명세서의 모든 Query Params를 service로 전달
        const filters = {
            page: req.query.page,
            size: req.query.size,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            // (★수정★) '전체' 값을 null로 변환
            eventType: req.query.eventType === '전체' ? null : req.query.eventType,
        };

        const { totalCount, logs } = await statsService.getEventLogs(filters);

        res.status(200).json(apiResponse.success({ totalCount, logs }, "Event logs retrieved"));
    } catch (error) {
        next(error);
    }
};

// v1.3 명세서 6번 (GET /api/admin/stats/kpis)
const getDashboardKpis = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        // (★수정★) TODO -> statsService 호출
        const kpis = await statsService.getDashboardKpis(startDate, endDate);

        res.status(200).json(apiResponse.success(kpis, "Dashboard KPIs retrieved"));
    } catch (error) {
        next(error);
    }
};

// v1.3 명세서 6번 (GET /api/admin/stats/kpi-trends)
const getKpiTrends = async (req, res, next) => {
    try {
        const { startDate, endDate, interval } = req.query;
        // (★수정★) TODO -> statsService 호출
        const data = await statsService.getKpiTrends(startDate, endDate, interval);
        res.status(200).json(apiResponse.success(data, "KPI Trends retrieved"));
    } catch (error) {
        next(error);
    }
};

// v1.3 명세서 6번 (GET /api/admin/stats/risk-types)
const getRiskTypes = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        // (★수정★) TODO -> statsService 호출
        const data = await statsService.getRiskTypes(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "Risk Types retrieved"));
    } catch (error) {
        next(error);
    }
};

// v1.3 명세서 6번 (GET /api/admin/stats/top-risk-regions)
const getTopRiskRegions = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        // (★수정★) TODO -> statsService 호출
        // (참고: DB에 'region_name' 컬럼이 없으면 500 오류 대신 빈 배열이 반환됩니다)
        const data = await statsService.getTopRiskRegions(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "Top Risk Regions retrieved"));
    } catch (error) {
        next(error);
    }
};

// v1.3 명세서 6번 (GET /api/admin/stats/hourly-risk)
const getHourlyRisk = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        // (★수정★) TODO -> statsService 호출
        const data = await statsService.getHourlyRisk(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "Hourly Risk retrieved"));
    } catch (error) {
        next(error);
    }
};

// v1.3 명세서 6번 (GET /api/admin/stats/monthly-safety-scores)
const getMonthlySafetyScores = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        // (★수정★) TODO -> statsService 호출
        const data = await statsService.getMonthlySafetyScores(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "Monthly Safety Scores retrieved"));
    } catch (error) {
        next(error);
    }
};

// v1.3 명세서 6번 (GET /api/admin/stats/regional-scores)
const getRegionalScores = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        // (★수정★) TODO -> statsService 호출
        // (참고: DB에 'region_name' 컬럼이 없으면 500 오류 대신 빈 배열이 반환됩니다)
        const data = await statsService.getRegionalScores(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "Regional Scores (TODO)"));
    } catch (error) {
        next(error);
    }
};

// v1.3 명세서 6번 (GET /api/admin/stats/user-group-comparison)
const getUserGroupComparison = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        // (★수정★) TODO -> statsService 호출
        const data = await statsService.getUserGroupComparison(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "User Group Comparison retrieved"));
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getRiskLogs,
    getSafetyScores,
    recalculateStats,
    getEventLogs,
    getDashboardKpis,
    getKpiTrends,
    getRiskTypes,
    getTopRiskRegions,
    getHourlyRisk,
    getMonthlySafetyScores,
    getRegionalScores, // (TODO)
    getUserGroupComparison
};