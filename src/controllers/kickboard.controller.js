// 킥보드 컨트롤러 계층 (Controllers) - "누가 일할지"
const kickboardService = require("../services/kickboard.service");
const apiResponse = require("../utils/apiResponse");

/**
 * GET /api/admin/kickboards
 * 모든 킥보드 조회 (관리자용, 페이징 및 필터링)
 * Query Params: page, size, status
 */
const getAllKickboards = async (req, res, next) => {
  try {
    const { page = 1, size = 10, status } = req.query;
    const result = await kickboardService.getAllKickboards(
      parseInt(page),
      parseInt(size),
      status
    );

    res.status(200).json(
      apiResponse.success(
        {
          totalCount: result.totalCount,
          kickboards: result.kickboards,
        },
        "All kickboards retrieved"
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/kickboards/:pmId
 * 특정 킥보드 조회
 */
const getKickboardById = async (req, res, next) => {
  try {
    const { pmId } = req.params;
    const kickboard = await kickboardService.getKickboardById(pmId);

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
 * POST /api/admin/kickboards
 * 킥보드 신규 등록
 * Body: { pm_id, initialLocation, battery, model }
 */
const createKickboard = async (req, res, next) => {
  try {
    const { pm_id, initialLocation, battery, model } = req.body;

    const kickboard = await kickboardService.createKickboard({
      pm_id,
      initialLocation,
      battery,
      model,
    });

    res.status(201).json(apiResponse.success(kickboard, "Kickboard created"));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/kickboards/:pmId
 * 킥보드 정보 업데이트
 * Body: { pm_status, location, battery }
 */
const updateKickboard = async (req, res, next) => {
  try {
    const { pmId } = req.params;
    const updateData = req.body;

    const kickboard = await kickboardService.updateKickboard(pmId, updateData);

    res.status(200).json(apiResponse.success(kickboard, "Kickboard updated"));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/kickboards/:pmId
 * 킥보드 삭제
 */
const deleteKickboard = async (req, res, next) => {
  try {
    const { pmId } = req.params;

    await kickboardService.deleteKickboard(pmId);

    res.status(200).json(apiResponse.success({}, "Kickboard deleted"));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/app/kickboards
 * 주변 킥보드 찾기 (GPS 기반)
 * Query Params: latitude, longitude, radius (기본값: 1000m)
 */
const getNearbyKickboards = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 1000 } = req.query;

    const kickboards = await kickboardService.getNearbyKickboards(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(radius)
    );

    res
      .status(200)
      .json(apiResponse.success(kickboards, "Nearby kickboards retrieved"));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/app/kickboards/helmet
 * 헬멧 착용 인증
 * Body: { kickboardId }
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
