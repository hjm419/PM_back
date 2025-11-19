// PM_back/src/controllers/stats.controller.js

const statsService = require("../services/stats.service");
const apiResponse = require("../utils/apiResponse");

const getRiskLogs = async (req, res, next) => {
    try { res.status(200).json(apiResponse.success([], "Risk logs retrieved")); } catch (error) { next(error); }
};

const getSafetyScores = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await statsService.getSafetyScoreDistribution(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "Safety scores retrieved"));
    } catch (error) { next(error); }
};

const recalculateStats = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const result = await statsService.recalculateStats(userId);
        res.status(200).json(apiResponse.success(result, "Stats recalculated"));
    } catch (error) { next(error); }
};

const getEventLogs = async (req, res, next) => {
    try {
        const filters = {
            page: req.query.page,
            size: req.query.size,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            eventType: req.query.eventType === '전체' ? null : req.query.eventType,
        };
        const { totalCount, logs } = await statsService.getEventLogs(filters);
        res.status(200).json(apiResponse.success({ totalCount, logs }, "Event logs retrieved"));
    } catch (error) { next(error); }
};

const getDashboardKpis = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const kpis = await statsService.getDashboardKpis(startDate, endDate);
        res.status(200).json(apiResponse.success(kpis, "Dashboard KPIs retrieved"));
    } catch (error) { next(error); }
};

const getKpiTrends = async (req, res, next) => {
    try {
        const { startDate, endDate, interval } = req.query;
        const data = await statsService.getKpiTrends(startDate, endDate, interval);
        res.status(200).json(apiResponse.success(data, "KPI Trends retrieved"));
    } catch (error) { next(error); }
};

const getRiskTypes = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await statsService.getRiskTypes(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "Risk Types retrieved"));
    } catch (error) { next(error); }
};

const getTopRiskRegions = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await statsService.getTopRiskRegions(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "Top Risk Regions retrieved"));
    } catch (error) { next(error); }
};

const getHourlyRisk = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await statsService.getHourlyRisk(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "Hourly Risk retrieved"));
    } catch (error) { next(error); }
};

const getMonthlySafetyScores = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await statsService.getMonthlySafetyScores(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "Monthly Safety Scores retrieved"));
    } catch (error) { next(error); }
};

const getRegionalScores = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await statsService.getRegionalScores(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "Regional Scores (TODO)"));
    } catch (error) { next(error); }
};

const getUserGroupComparison = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await statsService.getUserGroupComparison(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "User Group Comparison retrieved"));
    } catch (error) { next(error); }
};

const getTopRidersToday = async (req, res, next) => {
    try {
        const data = await statsService.getTopRidersToday();
        res.status(200).json(apiResponse.success(data, "Today's top riders retrieved"));
    } catch (error) { next(error); }
};

// (★신규★) GET /api/admin/stats/accident-kpi
const getAccidentKpiStats = async (req, res, next) => {
    try {
        const data = await statsService.getAccidentKpiStats();
        res.status(200).json(apiResponse.success(data, "Accident KPI stats retrieved"));
    } catch (error) { next(error); }
};

// (★신규★) GET /api/admin/stats/accident-trend
const getAccidentTrend = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await statsService.getAccidentTrend(startDate, endDate);
        res.status(200).json(apiResponse.success(data, "Accident trend retrieved"));
    } catch (error) { next(error); }
};

module.exports = {
    getRiskLogs, getSafetyScores, recalculateStats, getEventLogs, getDashboardKpis, getKpiTrends, getRiskTypes,
    getTopRiskRegions, getHourlyRisk, getMonthlySafetyScores, getRegionalScores, getUserGroupComparison,
    getTopRidersToday, getAccidentKpiStats, getAccidentTrend
};