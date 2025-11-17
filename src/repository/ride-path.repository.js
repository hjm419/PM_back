const db = require("../config/db");

/**
 * 주행경로 Repository
 */
// src/repository/ride-path.repository.js

class RidePathRepository {
  // ...
  async create(ridePathData) {
    const query = `
      INSERT INTO T_RIDE_PATH (ride_id, path_data)
      VALUES ($1, $2)
      RETURNING *;
    `;

    // [수정 전] 배열을 그대로 넘기면 PG가 '{...}' 형태(Postgres Array)로 변환하여 에러 발생
    // const values = [ridePathData.ride_id, ridePathData.path_data];

    // [수정 후] JSON.stringify()로 감싸서 '[...]' 형태(JSON String)로 변환
    const values = [
      ridePathData.ride_id,
      JSON.stringify(ridePathData.path_data),
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }
}

module.exports = new RidePathRepository();
