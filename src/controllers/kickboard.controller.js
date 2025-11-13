// PM_back/src/controllers/kickboard.controller.js

const KickboardRepository = require("../repository/kickboard.repository");
const apiResponse = require("../utils/apiResponse");
const { parseGeoJSON } = require("../utils/gis.util"); // (★신규★) GeoJSON 파서

/**
 * (★헬퍼 함수★)
 * DB에서 읽은 킥보드 데이터(GeoJSON 문자열)를
 * 프론트엔드용 {lat, lng} 객체로 변환합니다.
 */
const parseKickboardLocation = (kickboard) => {
    if (kickboard && kickboard.location) {
        kickboard.location = parseGeoJSON(kickboard.location);
    }
    return kickboard;
};


/**
 * GET /api/kickboards
 * 모든 킥보드 조회
 */
const getAllKickboards = async (req, res, next) => {
    try {
        const kickboards = await KickboardRepository.findAll();

        // (★수정★) GeoJSON 문자열을 {lat, lng} 객체로 파싱
        const parsedKickboards = kickboards.map(parseKickboardLocation);

        res
            .status(200)
            .json(apiResponse.success({
                totalCount: parsedKickboards.length,
                kickboards: parsedKickboards // (★수정★)
            }, "All kickboards retrieved"));

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
        const { pmId } = req.params;
        const kickboard = await KickboardRepository.findById(pmId);

        if (!kickboard) {
            return res
                .status(404)
                .json(apiResponse.error("Kickboard not found", 404));
        }

        // (★수정★) GeoJSON 문자열을 {lat, lng} 객체로 파싱
        res.status(200).json(apiResponse.success(parseKickboardLocation(kickboard), "Kickboard retrieved"));
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
        // v1.3 명세서 Request Body: { pm_id, initialLocation, battery, model }
        const { pm_id, initialLocation, battery, model } = req.body;

        const kickboard = await KickboardRepository.create({
            pm_id: pm_id,
            location: initialLocation, // { lat, lng } 객체 전달
            battery: battery,
            model: model,
            pm_status: 'available'
        });

        // (★수정★) Repo가 반환한 GeoJSON 문자열 파싱
        res.status(201).json(apiResponse.success(parseKickboardLocation(kickboard), "Kickboard created"));
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
        const { pmId } = req.params;
        const updateData = req.body; // { pmStatus, location: {lat, lng}, battery }

        const kickboard = await KickboardRepository.update(pmId, updateData);

        if (!kickboard) {
            return res
                .status(404)
                .json(apiResponse.error("Kickboard not found", 404));
        }

        // (★수정★) Repo가 반환한 GeoJSON 문자열 파싱
        res.status(200).json(apiResponse.success(parseKickboardLocation(kickboard), "Kickboard updated"));
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
        const { pmId } = req.params;
        const result = await KickboardRepository.delete(pmId);

        if (!result) {
            return res
                .status(404)
                .json(apiResponse.error("Kickboard not found", 404));
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// (★추가★) v1.3 명세서 - 원격 잠금
const lockKickboard = async (req, res, next) => {
    try {
        const { pmId } = req.params;
        // TODO: 원격 잠금 로직 구현 (DeviceSearchTab.vue가 호출)
        await KickboardRepository.update(pmId, { pm_status: 'maintenance' }); // '수리중'으로 변경
        res.status(200).json(apiResponse.success({ message: "Device locked (set to maintenance)" }, "Device locked"));
    } catch (error) {
        next(error);
    }
};

/**
 * (참고: 앱용 API - 수정 불필요)
 */
const getNearbyKickboards = async (req, res, next) => {
    // ... (기존 코드)
};
const verifyHelmet = async (req, res, next) => {
    // ... (기존 코드)
};

module.exports = {
    getAllKickboards,
    getKickboardById,
    createKickboard,
    updateKickboard,
    deleteKickboard,
    getNearbyKickboards, // (앱용)
    verifyHelmet, // (앱용)
    lockKickboard
};