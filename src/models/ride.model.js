// 라이드 모델 (T_RIDE 데이터 스키마)

/**
 * T_RIDE 테이블 스키마 정의 (사용자 DB 기준)
 *
 * CREATE TABLE t_ride (
 * ride_id VARCHAR(50) PRIMARY KEY,
 * user_id BIGINT NOT NULL REFERENCES t_user(user_id),
 * pm_id BIGINT NOT NULL REFERENCES t_kickboard(pm_id),
 * start_loc POINT, -- (★DB 실제 컬럼명)
 * end_loc POINT, -- (★DB 실제 컬럼명)
 * start_time TIMESTAMP,
 * end_time TIMESTAMP,
 * fare INT,
 * is_helmet BOOLEAN, -- (★DB 실제 컬럼명)
 * distance DECIMAL(10, 2), -- (1단계에서 추가됨)
 * duration INT, -- (1단계에서 추가됨)
 * score INT, -- (1단계에서 추가됨)
 * created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 * updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

class Ride {
  /**
   * Ride 스키마 필드 정의
   */
  static schema = {
    ride_id: { type: Number, primaryKey: true, description: "라이드 ID" },
    // (★수정★) String -> Number (DB 타입 bigint)
    user_id: { type: Number, foreignKey: "T_USER", description: "사용자 ID" },
    // (★수정★) String -> Number (DB 타입 bigint)
    pm_id: {
      type: Number,
      foreignKey: "T_KICKBOARD",
      description: "킥보드 ID",
    },
    // (★수정★) DB 컬럼명과 일치
    start_loc: { type: "Point", description: "시작 위치" },
    // (★수정★) DB 컬럼명과 일치
    end_loc: { type: "Point", description: "종료 위치" },
    start_time: { type: Date, description: "시작 시간" },
    end_time: { type: Date, description: "종료 시간" },
    fare: { type: Number, description: "요금 (원)" },
    // (★수정★) DB 컬럼명과 일치
    is_helmet: { type: Boolean, description: "헬멧 착용 여부" },
    // (★수정★) 1단계에서 추가한 컬럼
    distance: { type: Number, description: "거리 (km)" },
    duration: { type: Number, description: "소요 시간 (분)" },
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
    "start_loc", // (★수정★)
    "end_loc", // (★수정★)
    "start_time",
    "end_time",
    "fare",
    "is_helmet", // (★수정★)
    "distance", // (★수정★)
    "duration", // (★수정★)
    "score", // (★수정★)
    "created_at",
    "updated_at",
  ];
}

module.exports = Ride;
