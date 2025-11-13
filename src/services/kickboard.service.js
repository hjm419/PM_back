const KickboardRepository = require("../repository/kickboard.repository");

class KickboardService {
  /**
   * 모든 킥보드 조회 (페이징, 필터링)
   * @param {number} page - 페이지 번호 (기본값: 1)
   * @param {number} size - 페이지 크기 (기본값: 10)
   * @param {string} status - 필터: 'available', 'in-use', 'maintenance'
   * @returns {Promise<{totalCount: number, kickboards: array}>}
   */
  async getAllKickboards(page = 1, size = 10, status = null) {
    try {
      let allKickboards = await KickboardRepository.findAll();

      // 상태 필터링
      if (status) {
        allKickboards = allKickboards.filter((kb) => kb.pm_status === status);
      }

      const totalCount = allKickboards.length;

      // 페이징
      const offset = (page - 1) * size;
      const paginatedKickboards = allKickboards
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(offset, offset + size);

      return {
        totalCount,
        kickboards: paginatedKickboards,
      };
    } catch (error) {
      console.error("Service Error:", error);
      throw error;
    }
  }

  /**
   * 특정 킥보드 조회
   * @param {string} pmId - 킥보드 ID
   * @returns {Promise<object|null>}
   */
  async getKickboardById(pmId) {
    const kickboard = await KickboardRepository.findById(pmId);
    return kickboard;
  }

  /**
   * 킥보드 신규 등록
   * @param {object} data { pm_id, initialLocation, battery, model }
   * @returns {Promise<object>}
   */
  async createKickboard({ pm_id, initialLocation, battery, model }) {
    if (!pm_id || !initialLocation || battery === undefined) {
      const err = new Error("pm_id, initialLocation, and battery are required");
      err.status = 400;
      throw err;
    }

    const newKickboard = await KickboardRepository.create({
      pm_id,
      pm_status: "available",
      location: initialLocation,
      battery,
    });

    return {
      pm_id: newKickboard.pm_id,
      pm_status: newKickboard.pm_status,
      location: newKickboard.location,
      battery: newKickboard.battery,
    };
  }

  /**
   * 킥보드 정보 업데이트
   * @param {string} pmId
   * @param {object} updateData { pm_status, location, battery }
   * @returns {Promise<object>}
   */
  async updateKickboard(pmId, updateData) {
    // 유효한 필드만 업데이트 가능
    const allowedUpdates = {};
    if (updateData.pm_status) allowedUpdates.pm_status = updateData.pm_status;
    if (updateData.location) allowedUpdates.location = updateData.location;
    if (updateData.battery !== undefined)
      allowedUpdates.battery = updateData.battery;

    if (Object.keys(allowedUpdates).length === 0) {
      const err = new Error("No valid fields to update");
      err.status = 400;
      throw err;
    }

    const updated = await KickboardRepository.update(pmId, allowedUpdates);

    if (!updated) {
      const err = new Error("Kickboard not found");
      err.status = 404;
      throw err;
    }

    return {
      pm_id: updated.pm_id,
      pm_status: updated.pm_status,
      location: updated.location,
      battery: updated.battery,
    };
  }

  /**
   * 킥보드 삭제
   * @param {string} pmId
   * @returns {Promise<boolean>}
   */
  async deleteKickboard(pmId) {
    const result = await KickboardRepository.delete(pmId);
    if (!result) {
      const err = new Error("Kickboard not found");
      err.status = 404;
      throw err;
    }
    return true;
  }

  /**
   * 주변 킥보드 찾기 (GPS 기반)
   * @param {number} latitude - 사용자 위도
   * @param {number} longitude - 사용자 경도
   * @param {number} radius - 검색 반경 (m, 기본값: 1000)
   * @returns {Promise<array>}
   */
  async getNearbyKickboards(latitude, longitude, radius = 1000) {
    if (!latitude || !longitude) {
      const err = new Error("latitude and longitude are required");
      err.status = 400;
      throw err;
    }

    // 모든 이용 가능한 킥보드 조회
    const allKickboards = await KickboardRepository.findAll();

    // 'available' 상태의 킥보드만 필터링
    const availableKickboards = allKickboards.filter(
      (kb) => kb.pm_status === "available"
    );

    // 거리 계산 및 필터링 (간단한 예시: PostGIS 미사용 시)
    const nearbyKickboards = availableKickboards.filter((kickboard) => {
      // location 필드가 POINT 형식이라고 가정
      // 실제 구현은 DB에서 ST_Distance 함수 사용 권장
      return true; // TODO: 실제 거리 계산 로직 구현
    });

    return nearbyKickboards.map((kb) => ({
      pm_id: kb.pm_id,
      pm_status: kb.pm_status,
      location: kb.location,
      battery: kb.battery,
    }));
  }
}

module.exports = new KickboardService();
