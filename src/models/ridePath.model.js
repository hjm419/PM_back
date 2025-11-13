// 라이드 경로 모델 (T_RIDE_PATH 데이터 스키마)

/**
 * T_RIDE_PATH 테이블 스키마 정의
 *
 * CREATE TABLE t_ride_path (
 *   path_id VARCHAR(50) PRIMARY KEY,
 *   ride_id VARCHAR(50) NOT NULL REFERENCES t_ride(ride_id),
 *   location POINT,
 *   speed DECIMAL(5, 2),
 *   timestamp TIMESTAMP,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

class RidePath {
  /**
   * RidePath 스키마 필드 정의
   */
  static schema = {
    path_id: { type: String, primaryKey: true, description: "경로 ID" },
    ride_id: { type: String, foreignKey: "T_RIDE", description: "라이드 ID" },
    location: { type: "Point", description: "GPS 좌표" },
    speed: { type: Number, description: "속도 (km/h)" },
    timestamp: { type: Date, description: "기록 시간" },
    created_at: {
      type: Date,
      default: "CURRENT_TIMESTAMP",
      description: "생성 날짜",
    },
  };

  /**
   * RidePath 컬럼 매핑
   */
  static columns = [
    "path_id",
    "ride_id",
    "location",
    "speed",
    "timestamp",
    "created_at",
  ];
}

module.exports = RidePath;
