// 사용자 컨트롤러 계층 (Controllers) - "누가 일할지"
const userService = require("../services/user.service");
const apiResponse = require("../utils/apiResponse");

/**
 * GET /api/users/me
 * 현재 사용자 정보 조회
 */
const getMe = async (req, res, next) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res
                .status(401)
                .json(apiResponse.error("User not authenticated", 401));
        }

        const user = await userService.getUserById(userId);
        res.status(200).json(apiResponse.success(user, "User info retrieved"));
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/users/me
 * 현재 사용자 정보 업데이트
 */
const updateMe = async (req, res, next) => {
    try {
        const userId = req.user?.userId; // ⬅️ 토큰에서 "내" ID를 가져옴
        const updateData = req.body; // ⬅️ { user_name, telno }

        if (!userId) {
            return res
                .status(401)
                .json(apiResponse.error("User not authenticated", 401));
        }

        const updatedUser = await userService.updateUser(userId, updateData);
        res.status(200).json(apiResponse.success(updatedUser, "User updated"));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/users
 * 모든 사용자 조회 (관리자 전용)
 * (★수정★) 페이징 및 검색 파라미터(req.query)를 서비스로 전달
 */
const getAllUsers = async (req, res, next) => {
    try {
        // (★수정★) v1.3 명세서의 모든 Query Params를 service로 전달
        const filters = {
            page: req.query.page,
            size: req.query.size,
            searchKeyword: req.query.searchKeyword,
        };

        const { totalCount, users } = await userService.getAllUsers(filters);

        res.status(200).json(apiResponse.success({ totalCount, users }, "All users retrieved"));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/users/:id
 * 특정 사용자 조회
 */
const getUserById = async (req, res, next) => {
    try {
        // (★수정★) 1.2에서 수정한 내용
        const { userId } = req.params;
        const user = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).json(apiResponse.error("User not found", 404));
        }

        res.status(200).json(apiResponse.success(user, "User retrieved"));
    } catch (error) {
        next(error);
    }
};

/**
 * (★신규★) GET /api/admin/users/:userId/risks
 * 특정 사용자의 위험 이력 (페이징)
 */
const getUserRiskHistory = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const filters = {
            userId: userId,
            page: req.query.page || 1,
            size: req.query.size || 5, // 팝업창 기본 5개
        };

        const { totalCount, logs } = await userService.getUserRiskHistory(filters);

        res.status(200).json(apiResponse.success({ totalCount, logs }, "User risk history retrieved"));
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/v1/users/:id
 * 사용자 정보 업데이트
 */
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const user = await userService.updateUser(id, updateData);
        res.status(200).json(apiResponse.success(user, "User updated"));
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/users/:id
 * 사용자 삭제
 */
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await userService.deleteUser(id);

        if (!result) {
            return res.status(44).json(apiResponse.error("User not found", 404));
        }

        res.status(200).json(apiResponse.success({}, "User deleted"));
    } catch (error) {
        next(error);
    }
};

const getMyRides = async (req, res, next) => {
    // TODO: 내 주행내역 조회 구현
    res.status(200).json({ message: "getMyRides not implemented" });
};

const getScoreHistory = async (req, res, next) => {
    // TODO: 점수 변동 내역 구현
    res.status(200).json({ message: "getScoreHistory not implemented" });
};

const getScoreStats = async (req, res, next) => {
    // TODO: 감점 요인 통계 구현
    res.status(200).json({ message: "getScoreStats not implemented" });
};

module.exports = {
    getMe,
    updateMe,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getMyRides,
    getScoreHistory,
    getScoreStats,
    getUserRiskHistory, // (★추가★)
};