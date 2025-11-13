// 사용자 모델 (T_USER 데이터 스키마)

/**
 * T_USER 테이블 스키마 정의
 *
 * CREATE TABLE t_user (
 *   user_id VARCHAR(50) PRIMARY KEY,
 *   login_id VARCHAR(255) UNIQUE NOT NULL,
 *   user_pw VARCHAR(255) NOT NULL,
 *   nickname VARCHAR(100),
 *   safety_score INT DEFAULT 100,
 *   role VARCHAR(20) DEFAULT 'user',  -- 'user', 'admin'
 *   telno VARCHAR(20),
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

class User {
  /**
   * User 스키마 필드 정의
   */
  static schema = {
    user_id: { type: String, primaryKey: true, description: "사용자 ID" },
    login_id: {
      type: String,
      unique: true,
      required: true,
      description: "로그인 ID",
    },
    user_pw: { type: String, required: true, description: "비밀번호" },
    nickname: { type: String, description: "닉네임" },
    safety_score: { type: Number, default: 100, description: "안전 점수" },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
      description: "사용자 역할",
    },
    telno: { type: String, description: "전화번호" },
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
   * User 컬럼 매핑
   */
  static columns = [
    "user_id",
    "login_id",
    "user_pw",
    "nickname",
    "safety_score",
    "role",
    "telno",
    "created_at",
    "updated_at",
  ];
}

module.exports = User;
