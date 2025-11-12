// 킥보드 컨트롤러 계층 (Controllers) - "누가 일할지"
const Kickboard = require("../models/kickboard.model");
const apiResponse = require("../utils/apiResponse");

/**
 * GET /api/kickboards
 * 모든 킥보드 조회
 */
const getAllKickboards = async (req, res, next) => {
  try {
    const kickboards = await Kickboard.findAll();
    res
      .status(200)
      .json(apiResponse.success(kickboards, "All kickboards retrieved"));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/kickboards/:id
 * 특정 킥보드 조회
 */
const getKickboardById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const kickboard = await Kickboard.findById(id);

    if (!kickboard) {
      return res
        .status(404)
        .json(apiResponse.error("Kickboard not found", 404));
    }

    res.status(200).json(apiResponse.success(kickboard, "Kickboard retrieved"));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/kickboards
 * 새 킥보드 생성
 */
const createKickboard = async (req, res, next) => {
  try {
    const { device_id, status, latitude, longitude, battery_level } = req.body;

    const kickboard = await Kickboard.create({
      device_id,
      status,
      latitude,
      longitude,
      battery_level,
    });

    res.status(201).json(apiResponse.success(kickboard, "Kickboard created"));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/kickboards/:id
 * 킥보드 정보 업데이트
 */
const updateKickboard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const kickboard = await Kickboard.update(id, updateData);

    if (!kickboard) {
      return res
        .status(404)
        .json(apiResponse.error("Kickboard not found", 404));
    }

    res.status(200).json(apiResponse.success(kickboard, "Kickboard updated"));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/kickboards/:id
 * 킥보드 삭제
 */
const deleteKickboard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Kickboard.delete(id);

    if (!result) {
      return res
        .status(404)
        .json(apiResponse.error("Kickboard not found", 404));
    }

    res.status(200).json(apiResponse.success({}, "Kickboard deleted"));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/app/kickboards
 * 주변 킥보드 찾기 (GPS 기반)
 */
const getNearbyKickboards = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 1000 } = req.query;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json(apiResponse.error("latitude and longitude are required", 400));
    }

    // TODO: 주변 킥보드 조회 로직 구현 (거리 계산)
    res
      .status(200)
      .json(apiResponse.success([], "Nearby kickboards retrieved"));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/app/kickboards/helmet
 * 헬멧 착용 인증
 */
const verifyHelmet = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { kickboardId } = req.body;

    if (!userId || !kickboardId) {
      return res
        .status(400)
        .json(apiResponse.error("userId and kickboardId are required", 400));
    }

    // TODO: 헬멧 인증 로직 구현
    res.status(200).json(apiResponse.success({}, "Helmet verified"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllKickboards,
  getKickboardById,
  createKickboard,
  updateKickboard,
  deleteKickboard,
  getNearbyKickboards,
  verifyHelmet,
};
