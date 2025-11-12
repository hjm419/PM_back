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
 * PUT /api/v1/users/me
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
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(apiResponse.success(users, "All users retrieved"));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/users/:id
 * 특정 사용자 조회
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json(apiResponse.error("User not found", 404));
    }

    res.status(200).json(apiResponse.success(user, "User retrieved"));
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
      return res.status(404).json(apiResponse.error("User not found", 404));
    }

    res.status(200).json(apiResponse.success({}, "User deleted"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
    updateMe,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
