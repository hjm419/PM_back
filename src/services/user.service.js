// 사용자 비즈니스 로직
class UserService {
  /**
   * 사용자 정보 조회
   * @param {string} userId
   * @returns {Promise<{id, email, name, role}>}
   */
  async getUserById(userId) {
    // TODO: DB에서 사용자 조회
    // const user = await User.findById(userId);
    // return user;
    return {
      id: userId,
      email: "user@example.com",
      name: "User Name",
      role: "user",
    };
  }

  /**
   * 모든 사용자 조회 (관리자용)
   * @returns {Promise<Array>}
   */
  async getAllUsers() {
    // TODO: DB에서 모든 사용자 조회
    // const users = await User.findAll();
    // return users;
    return [];
  }

  /**
   * 사용자 정보 업데이트
   * @param {string} userId
   * @param {object} updateData
   * @returns {Promise<{id, email, name, role}>}
   */
  async updateUser(userId, updateData) {
    // TODO: DB에서 사용자 업데이트
    // const user = await User.findByIdAndUpdate(userId, updateData);
    // return user;
    return { id: userId, ...updateData };
  }

  /**
   * 사용자 삭제
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async deleteUser(userId) {
    // TODO: DB에서 사용자 삭제
    // await User.findByIdAndDelete(userId);
    return true;
  }
}

module.exports = new UserService();
