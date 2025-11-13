// 위험로그 모델 (T_RISK_LOG 데이터 스키마)

/**
 * T_RISK_LOG 테이블 스키마 정의
 *
 * CREATE TABLE t_risk_log (
 *   log_id VARCHAR(50) PRIMARY KEY,
 *   ride_id VARCHAR(50) NOT NULL REFERENCES t_ride(ride_id),
 *   kpi_id VARCHAR(50) NOT NULL REFERENCES t_risk_kpi(kpi_id),
 *   timestamp TIMESTAMP NOT NULL,
 *   location POINT,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

class RiskLog {
  /**
   * RiskLog 스키마 필드 정의
   */
  static schema = {
    log_id: { type: String, primaryKey: true, description: "로그 ID" },
    ride_id: {
      type: String,
      required: true,
      foreign: "t_ride.ride_id",
      description: "주행 ID",
    },
    kpi_id: {
      type: String,
      required: true,
      foreign: "t_risk_kpi.kpi_id",
      description: "KPI ID",
    },
    timestamp: { type: Date, required: true, description: "발생 시간" },
    location: { type: "Point", description: "발생 위치" },
    created_at: {
      type: Date,
      default: "CURRENT_TIMESTAMP",
      description: "기록 날짜",
    },
  };

  /**
   * RiskLog 컬럼 매핑
   */
  static columns = [
    "log_id",
    "ride_id",
    "kpi_id",
    "timestamp",
    "location",
    "created_at",
  ];
}

module.exports = RiskLog;
