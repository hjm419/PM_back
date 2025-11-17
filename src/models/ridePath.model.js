// RidePath model — T_RIDE_PATH 데이터 스키마
/*
 CREATE TABLE t_ride_path (
   path_id SERIAL PRIMARY KEY,
   ride_id BIGINT NOT NULL REFERENCES t_ride(ride_id),
   path_data JSONB,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
*/

class RidePath {
  /**
   * RidePath 스키마 필드 정의
   * Aligns with DB: path_id (serial primary key), ride_id (bigint fk), path_data (jsonb), created_at
   */
  static schema = {
    path_id: {
      type: Number,
      primaryKey: true,
      description: "경로 ID (serial)",
    },
    ride_id: { type: Number, foreignKey: "T_RIDE", description: "라이드 ID" },
    path_data: {
      type: "JSONB",
      description: "주행 경로 데이터 (GeoJSON or array of points)",
    },
    created_at: {
      type: Date,
      default: "CURRENT_TIMESTAMP",
      description: "생성 일시",
    },
  };

  /**
   * RidePath 컬럼 매핑
   */
  static columns = ["path_id", "ride_id", "path_data", "created_at"];
}

module.exports = RidePath;
