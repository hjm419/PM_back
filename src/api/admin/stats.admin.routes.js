// PM_back/src/api/admin/stats.admin.routes.js

const express = require("express");
const router = express.Router();

// 통계 컨트롤러 불러오기
const statsController = require("../../controllers/stats.controller");

// -------------------------------------------------------
// 1. 대시보드 및 핵심 통계 (v1.3 명세서)
// -------------------------------------------------------

// [대시보드] KPI 5종 조회 (누적 이용자, 운행 수, 위험 행동 수, 거리, 헬멧 착용률)
router.get("/kpis", statsController.getDashboardKpis);

// [대시보드] 월별 평균 안전 점수 추이 (라인 차트)
router.get("/monthly-safety-scores", statsController.getMonthlySafetyScores);

// [대시보드] 시간대별 총 위험 행동 발생 건수 (막대 차트)
router.get("/hourly-risk", statsController.getHourlyRisk);

// [대시보드] 오늘 가장 많이 운행한 사용자 Top 5 (리스트)
router.get("/top-riders-today", statsController.getTopRidersToday);


// -------------------------------------------------------
// 2. 통계 분석 페이지 (StatsView.vue)
// -------------------------------------------------------

// [통계] KPI 지표 트렌드 조회 (최근 30일, 라인 차트)
router.get("/kpi-trends", statsController.getKpiTrends);

// [통계] 위험 행동 유형별 발생 비율 (파이 차트)
router.get("/risk-types", statsController.getRiskTypes);

// [통계] 안전 점수 구간별 사용자 분포 (히스토그램/막대 차트)
router.get("/safety-scores", statsController.getSafetyScores);

// [통계] 사용자 그룹별(신규/단골 등) 평균 안전 점수 비교
router.get("/user-group-comparison", statsController.getUserGroupComparison);


// -------------------------------------------------------
// 3. (★신규★) 사고 심층 분석 (기존 더미 데이터 대체)
// -------------------------------------------------------

// [통계] 사고 발생 시 주요 원인(KPI) 빈도 분석 (가로 막대 차트)
router.get("/accident-kpi", statsController.getAccidentKpiStats);

// [통계] 일별 사고 발생률 추이 조회 (최근 30일, 라인 차트)
router.get("/accident-trend", statsController.getAccidentTrend);


// -------------------------------------------------------
// 4. 기타 / 관리 기능
// -------------------------------------------------------

// [관리] 전체 주행 및 사용자 안전 점수 강제 재계산 (배치 작업용)
router.post("/rides/stats", statsController.recalculateStats);

// [미사용/보류] 지역별 안전 점수 (DB 컬럼 부재로 현재 더미/빈값 반환)
router.get("/regional-scores", statsController.getRegionalScores);

// [미사용/보류] Top 5 위험 지역 (DB 컬럼 부재로 현재 빈값 반환)
router.get("/top-risk-regions", statsController.getTopRiskRegions);


module.exports = router;