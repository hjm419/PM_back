// 라이드 모델 (T_RIDE 데이터 스키마)

/**
 * T_RIDE 테이블 스키마 정의
 *
 * CREATE TABLE t_ride (
 *   ride_id VARCHAR(50) PRIMARY KEY,
 *   user_id VARCHAR(50) NOT NULL REFERENCES t_user(user_id),
 *   pm_id VARCHAR(50) NOT NULL REFERENCES t_kickboard(pm_id),
 *   start_location POINT,
 *   end_location POINT,
 *   start_time TIMESTAMP,
 *   end_time TIMESTAMP,
 *   distance DECIMAL(10, 2),
 *   duration INT,
 *   fare INT,
 *   score INT,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

class Ride {
  /**
   * Ride 스키마 필드 정의
   */
  static schema = {
    ride_id: { type: String, primaryKey: true, description: "라이드 ID" },
    user_id: { type: String, foreignKey: "T_USER", description: "사용자 ID" },
    pm_id: {
      type: String,
      foreignKey: "T_KICKBOARD",
      description: "킥보드 ID",
    },
    start_location: { type: "Point", description: "시작 위치" },
    end_location: { type: "Point", description: "종료 위치" },
    start_time: { type: Date, description: "시작 시간" },
    end_time: { type: Date, description: "종료 시간" },
    distance: { type: Number, description: "거리 (km)" },
    duration: { type: Number, description: "소요 시간 (분)" },
    fare: { type: Number, description: "요금 (원)" },
    score: { type: Number, description: "사용자 점수" },
    created_at: {
      type: Date,
      default: "CURRENT_TIMESTAMP",
      description: "생성 날짜",
    },
    updated_at: {
      type: Date,
      default: "CURRENT_TIMESTAMP",
      description: "수정 날짜",
    },
  };

  /**
   * Ride 컬럼 매핑
   */
  static columns = [
    "ride_id",
    "user_id",
    "pm_id",
    "start_location",
    "end_location",
    "start_time",
    "end_time",
    "distance",
    "duration",
    "fare",
    "score",
    "created_at",
    "updated_at",
  ];
}

module.exports = Ride;
