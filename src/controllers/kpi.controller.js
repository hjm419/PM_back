const kpiService = require("../services/kpi.service");
const apiResponse = require("../utils/apiResponse");

/**
 * KPI 항목 신규 등록
 */
const createKPI = async (req, res, next) => {
  try {
    const { name, weight } = req.body;
    if (!name || weight == null) {
      return res
        .status(400)
        .json(apiResponse.error("KPI 이름과 가중치는 필수입니다", 400));
    }
    const newKPI = await kpiService.createKPI({ name, weight });
    res
      .status(201)
      .json(apiResponse.success(newKPI, "KPI 항목이 생성되었습니다"));
  } catch (error) {
    next(error);
  }
};

/**
 * KPI 항목 목록 조회
 */
const getAllKPIs = async (req, res, next) => {
  try {
    const kpis = await kpiService.getAllKPIs();
    res.status(200).json(apiResponse.success(kpis, "KPI 항목 목록입니다"));
  } catch (error) {
    next(error);
  }
};

/**
 * KPI 항목 수정
 */
const updateKPI = async (req, res, next) => {
  try {
    const { kpiId } = req.params;
    const updateData = req.body;
    const updatedKPI = await kpiService.updateKPI(kpiId, updateData);
    res
      .status(200)
      .json(apiResponse.success(updatedKPI, "KPI 항목이 수정되었습니다"));
  } catch (error) {
    next(error);
  }
};

/**
 * KPI 항목 삭제
 */
const deleteKPI = async (req, res, next) => {
  try {
    const { kpiId } = req.params;
    await kpiService.deleteKPI(kpiId);
    res
      .status(200)
      .json(apiResponse.success(null, "KPI 항목이 삭제되었습니다"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createKPI,
  getAllKPIs,
  updateKPI,
  deleteKPI,
};
