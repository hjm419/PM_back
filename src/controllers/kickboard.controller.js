// 킥보드 컨트롤러 계층 (Controllers) - "누가 일할지"
const KickboardRepository = require("../repository/kickboard.repository"); // (★수정★) Repository를 가져옵니다.
const apiResponse = require("../utils/apiResponse");
const aiService = require("../services/ai.service");
const kickboardService = require("../services/kickboard.service");
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
 * GET /api/admin/kickboards
 * 모든 킥보드 조회 (관리자용, 페이징 및 필터링)
 * Query Params: page, size, status
 */
const getAllKickboards = async (req, res, next) => {
    try {
        // (★수정★) Kickboard -> KickboardRepository
        const kickboards = await KickboardRepository.findAll();

        // (★수정★) GeoJSON 파싱 및 프론트엔드 형식에 맞게 응답
        const parsedKickboards = kickboards.map(parseKickboardLocation);
        res
            .status(200)
            .json(apiResponse.success({
                totalCount: parsedKickboards.length,
                kickboards: parsedKickboards
            }, "All kickboards retrieved"));
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
        // (★수정★) id -> pmId (라우트 파라미터와 일치)
        const { pmId } = req.params;
        // (★수정★) Kickboard -> KickboardRepository
        const kickboard = await KickboardRepository.findById(pmId);

        if (!kickboard) {
            return res
                .status(404)
                .json(apiResponse.error("Kickboard not found", 404));
        }

        // (★수정★) GeoJSON 문자열을 {lat, lng} 객체로 파싱
        res
            .status(200)
            .json(
                apiResponse.success(
                    parseKickboardLocation(kickboard),
                    "Kickboard retrieved"
                )
            );
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
        // (★수정★) 관리자 API 명세서에 맞게 req.body 수정
        const { pm_id, initialLocation, battery, model } = req.body;

        // (★수정★) Kickboard -> KickboardRepository
        const kickboard = await KickboardRepository.create({
            pm_id: pm_id,
            location: initialLocation, // { lat, lng } 객체 전달
            battery: battery,
            model: model,
            pm_status: 'available'
        });

        // (★수정★) Repo가 반환한 GeoJSON 문자열 파싱
        res
            .status(201)
            .json(
                apiResponse.success(
                    parseKickboardLocation(kickboard),
                    "Kickboard created"
                )
            );
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
        // (★수정★) id -> pmId (라우트 파라미터와 일치)
        const { pmId } = req.params;
        const updateData = req.body;

        // (★수정★) Kickboard -> KickboardRepository
        const kickboard = await KickboardRepository.update(pmId, updateData);

        if (!kickboard) {
            return res
                .status(404)
                .json(apiResponse.error("Kickboard not found", 404));
        }

        // (★수정★) Repo가 반환한 GeoJSON 문자열 파싱
        res
            .status(200)
            .json(
                apiResponse.success(
                    parseKickboardLocation(kickboard),
                    "Kickboard updated"
                )
            );
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
        // (★수정★) id -> pmId (라우트 파라미터와 일치)
        const { pmId } = req.params;
        // (★수정★) Kickboard -> KickboardRepository
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

// (★신규★) v1.3 명세서 - 원격 잠금 (라우터에 필요하여 추가)
const lockKickboard = async (req, res, next) => {
    try {
        const { pmId } = req.params;
        // (★수정★) KickboardRepository 사용
        await KickboardRepository.update(pmId, { pm_status: 'maintenance' }); // '수리중'으로 변경
        res.status(200).json(apiResponse.success({ message: "Device locked (set to maintenance)" }, "Device locked"));
    } catch (error) {
        next(error);
    }
};


// --- (★아래는 요청대로 수정하지 않은 앱(app)용 함수 원본★) ---

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

        // 서비스 호출하여 실제 DB 데이터 조회
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
 */
const verifyHelmet = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json(apiResponse.error("이미지 파일이 없습니다.", 400));
        }

        // ✨ 여기서 kickboardService가 아니라 aiService를 사용!
        const aiResult = await aiService.checkHelmet(
            req.file.buffer,
            req.file.originalname
        );

        // AI 결과 분석 (confidence 0.5 이상)
        // 파이썬 서버 응답 구조: { detections: [{ class_name, confidence, ... }] }
        const detections = aiResult.detections || [];
        const isHelmet = detections.some(d => d.class_name === 'helmet' && d.confidence >= 0.5);

        if (isHelmet) {
            return res.status(200).json(apiResponse.success({
                verified: true,
                message: "헬멧 인증 성공",
                score: detections[0]?.confidence || 0
            }));
        } else {
            return res.status(200).json(apiResponse.success({
                verified: false,
                message: "헬멧이 감지되지 않았습니다.",
            }));
        }

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
    getNearbyKickboards, // (앱용)
    verifyHelmet, // (앱용)
    lockKickboard, // (★수정★)
};