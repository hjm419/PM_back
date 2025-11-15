// 사용자 비즈니스 로직
const UserRepository = require("../repository/user.repository");
const RiskLogRepository = require("../repository/risk-log.repository"); // (★추가★)
const RideRepository = require("../repository/ride.repository");

class UserService {
    /**
     * (★수정★) 사용자 정보 + 통계 조회 (이력 조회는 분리됨)
     * @param {string} userId (t_user의 'user_id' (pk)임)
     * @returns {Promise<object>}
     */
    async getUserById(userId) {
        // 1. 기본 정보
        const userPromise = UserRepository.findById(userId);
        // 2. 누적 통계
        const statsPromise = UserRepository.getUserStats(userId);

        // (★수정★) 이력 조회(historyPromise) 제거

        // 2가지 DB 조회를 동시에 실행
        const [user, stats] = await Promise.all([
            userPromise,
            statsPromise,
        ]);

        if (!user) {
            return null; // 사용자가 없으면 null 반환
        }

        // (중요) 비밀번호는 절대 반환하면 안 됨
        delete user.user_pw;

        // 4. 프론트엔드가 요청한 형식으로 데이터 조합
        return {
            ...user,
            total_rides: parseInt(stats.total_rides || 0),
            total_payment: parseInt(stats.total_payment || 0),
            // (★수정★) risk_history 제거
        };
    }

    /**
     * (★신규★) 사용자의 위험 이력 페이징 조회
     * @param {object} filters { userId, page, size }
     * @returns {Promise<object>} { totalCount, logs }
     */
    async getUserRiskHistory(filters) {
        const { rows, totalCount } = await RiskLogRepository.findAndCountAllByUserId(filters);

        // API 응답에 맞게 가공
        const logs = rows.map(log => ({
            date: log.timestamp.toISOString().split('T')[0],
            time: log.timestamp.toTimeString().split(' ')[0],
            type: log.kpi_name,
            // (★수정★) "조치 내역" 컬럼 제거
        }));

        return { totalCount, logs };
    }

    /**
     * 모든 사용자 조회 (관리자용)
     * @returns {Promise<Array>}
     */
    async getAllUsers(filters) {
        const { rows, totalCount } = await UserRepository.findAndCountAllAdmin(filters);

        // 모든 사용자의 비밀번호 필드 제거
        const users = rows.map((user) => {
            delete user.user_pw;
            return {
                userId: user.user_id,
                loginId: user.login_id,
                nickname: user.nickname,
                safetyScore: user.safety_score,
                joinDate: user.created_at,
                role: user.role
            };
        });

        return { totalCount, users };
    }

    /**
     * (★신규★)
     * 안전 점수 낮은 사용자 Top 5 조회 (대시보드용)
     * @returns {Promise<Array>}
     */
    async getTopRiskUsers() {
        const users = await UserRepository.findTopRiskUsers(5);
        return users.map(user => ({
            // DB 컬럼명(snake_case)을 프론트엔드(camelCase)로 매핑
            userId: user.user_id,
            nickname: user.nickname,
            safetyScore: user.safety_score
        }));
    }

    /**
     * 사용자 정보 업데이트
     * @param {string} userId (t_user의 'user_id' (pk)임)
     * @param {object} updateData { user_name, telno }
     * @returns {Promise<object>}
     */
    async updateUser(userId, updateData) {
        const allowedUpdates = {
            user_name: updateData.user_name,
            telno: updateData.telno,
        };

        Object.keys(allowedUpdates).forEach((key) => {
            if (allowedUpdates[key] === undefined) {
                delete allowedUpdates[key];
            }
        });

        if (Object.keys(allowedUpdates).length === 0) {
            throw new Error("No valid fields to update");
        }

        const updatedUser = await UserRepository.update(userId, allowedUpdates);

        if (updatedUser) {
            delete updatedUser.user_pw; // 비밀번호 제거 후 반환
        }
        return updatedUser;
    }

    /**
     * 사용자 삭제
     * @param {string} userId
     * @returns {Promise<boolean>}
     */
    async deleteUser(userId) {
        return await UserRepository.delete(userId);
    }

    /**
     * 내 주행 이력 조회 (앱 HistoryScreen용)
     */
    async getMyRides(userId) {
        // 1. DB에서 해당 유저의 모든 주행 기록 조회
        const rides = await RideRepository.findByUserId(userId);

        // 2. 프론트엔드가 쓰기 편하게 데이터 가공 (null 처리 및 포맷팅)
        return rides.map(ride => ({
            ride_id: ride.ride_id,
            pm_id: ride.pm_id,
            start_time: ride.start_time,
            // DB에 저장된 거리(km)가 없으면 0으로 처리, 소수점 2자리 문자열로 변환
            distance: parseFloat(ride.distance || 0).toFixed(1),
            duration: ride.duration || 0, // 분 단위
            fare: ride.fare || 0,         // 금액
            score: ride.score || 0        // 점수
        }));
    }
    /**
     * (★신규 추가★) 앱 전용: 거리, 시간까지 포함한 통계 조회
     */
    static async getUserProfileStats(userId) {
        try {
            const query = `
                SELECT
                    COUNT(ride_id) AS "total_rides",
                    COALESCE(SUM(distance), 0) AS "total_distance",
                    COALESCE(SUM(duration), 0) AS "total_duration"
                FROM t_ride
                WHERE user_id = $1
            `;
            const result = await db.query(query, [userId]);
            return result.rows[0] || {
                total_rides: 0,
                total_distance: 0,
                total_duration: 0
            };
        } catch (error) {
            console.error("DB Error (getUserProfileStats):", error);
            throw error;
        }
    }
}

module.exports = new UserService();