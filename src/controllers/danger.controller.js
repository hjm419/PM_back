// 위험 구역 컨트롤러 계층 (Controllers) - "누가 일할지"
const apiResponse = require("../utils/apiResponse");

/**
 * GET /api/v1/danger
 * 모든 위험 구역 조회
 */
const getDangerZones = async (req, res, next) => {
  try {
    // TODO: DB에서 위험 구역 조회
    res.status(200).json(apiResponse.success([], "Danger zones retrieved"));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/danger
 * 위험 구역 등록
 */
const createDangerZone = async (req, res, next) => {
  try {
    const { latitude, longitude, radius, description } = req.body;
    // TODO: DB에 위험 구역 저장
    res
      .status(201)
      .json(
        apiResponse.success(
          { latitude, longitude, radius, description },
          "Danger zone created"
        )
      );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDangerZones,
  createDangerZone,
};
