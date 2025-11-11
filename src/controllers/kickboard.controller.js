// 킥보드 컨트롤러 계층 (Controllers) - "누가 일할지"
const Kickboard = require("../models/kickboard.model");
const apiResponse = require("../utils/apiResponse");

/**
 * GET /api/v1/kickboards
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
 * GET /api/v1/kickboards/:id
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
 * POST /api/v1/kickboards
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
 * PUT /api/v1/kickboards/:id
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

module.exports = {
  getAllKickboards,
  getKickboardById,
  createKickboard,
  updateKickboard,
};
