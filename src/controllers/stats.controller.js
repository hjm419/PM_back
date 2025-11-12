const statsService = require("../services/kpi.service");
const apiResponse = require("../utils/apiResponse");

/**
 * GET /api/admin/stats/rides-logs
 * 위험 로그 분석/조회
 */
const getRiskLogs = async (req, res, next) => {
  try {
    // TODO: 위험 로그 분석 조회 구현
    res.status(200).json(apiResponse.success([], "Risk logs retrieved"));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats/rides/safety-scores
 * 안전 점수 통계 조회
 */
const getSafetyScores = async (req, res, next) => {
  try {
    // TODO: 안전 점수 통계 조회 구현
    res.status(200).json(apiResponse.success([], "Safety scores retrieved"));
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
    // TODO: 점수 재계산 로직 구현
    res.status(200).json(apiResponse.success({}, "Stats recalculated"));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats/rides
 * 주행 기록 조회
 */
const getAllRides = async (req, res, next) => {
  try {
    // TODO: 전체 주행 기록 조회 구현
    res.status(200).json(apiResponse.success([], "All rides retrieved"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRiskLogs,
  getSafetyScores,
  recalculateStats,
  getAllRides,
};
