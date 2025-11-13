// KPI 모델 (T_RISK_KPI 데이터 스키마)

/**
 * T_RISK_KPI 테이블 스키마 정의
 *
 * CREATE TABLE t_risk_kpi (
 *   kpi_id VARCHAR(50) PRIMARY KEY,
 *   date DATE,
 *   total_rides INT,
 *   total_revenue INT,
 *   total_distance DECIMAL(10, 2),
 *   avg_ride_time INT,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

class KPI {
  /**
   * KPI 스키마 필드 정의
   */
  static schema = {
    kpi_id: { type: String, primaryKey: true, description: "KPI ID" },
    date: { type: Date, description: "통계 날짜" },
    total_rides: { type: Number, description: "총 라이드 수" },
    total_revenue: { type: Number, description: "총 수익 (원)" },
    total_distance: { type: Number, description: "총 거리 (km)" },
    avg_ride_time: { type: Number, description: "평균 라이드 시간 (분)" },
    created_at: {
      type: Date,
      default: "CURRENT_TIMESTAMP",
      description: "생성 날짜",
    },
  };

  /**
   * KPI 컬럼 매핑
   */
  static columns = [
    "kpi_id",
    "date",
    "total_rides",
    "total_revenue",
    "total_distance",
    "avg_ride_time",
    "created_at",
  ];
}

module.exports = KPI;
