// 킥보드 모델 (T_KICKBOARD 데이터 스키마)

/**
 * T_KICKBOARD 테이블 스키마 정의
 *
 * CREATE TABLE t_kickboard (
 *   pm_id VARCHAR(50) PRIMARY KEY,
 *   pm_status VARCHAR(50) DEFAULT 'available',  -- 'available', 'in-use', 'maintenance'
 *   location POINT,
 *   battery INT,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

class Kickboard {
  /**
   * Kickboard 스키마 필드 정의
   */
  static schema = {
    pm_id: { type: String, primaryKey: true, description: "킥보드 ID" },
    pm_status: {
      type: String,
      default: "available",
      enum: ["available", "in-use", "maintenance"],
      description: "킥보드 상태",
    },
    location: { type: "Point", description: "GPS 좌표" },
    battery: { type: Number, description: "배터리 잔량 (%)" },
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
   * Kickboard 컬럼 매핑
   */
  static columns = [
    "pm_id",
    "pm_status",
    "location",
    "battery",
    "created_at",
    "updated_at",
  ];
}

module.exports = Kickboard;
