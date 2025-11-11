// 사용자 모델 (T_USER, role 컬럼 포함)
const db = require('../config/db');

/**
 * 사용자 스키마 (PostgreSQL)
 * CREATE TABLE t_user (
 *   id SERIAL PRIMARY KEY,
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   password VARCHAR(255) NOT NULL,
 *   name VARCHAR(100),
 *   role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin'
 *   phone VARCHAR(20),
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

class User {
  /**
   * 이메일로 사용자 조회
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  static async findByEmail(email) {
    try {
      const result = await db.query('SELECT * FROM t_user WHERE email = $1', [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('DB Error:', error);
      throw error;
    }
  }

  /**
   * ID로 사용자 조회
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM t_user WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('DB Error:', error);
      throw error;
    }
  }

  /**
   * 모든 사용자 조회
   * @returns {Promise<array>}
   */
  static async findAll() {
    try {
      const result = await db.query('SELECT * FROM t_user');
      return result.rows;
    } catch (error) {
      console.error('DB Error:', error);
      throw error;
    }
  }

  /**
   * 사용자 생성
   * @param {object} userData { email, password, name, role }
   * @returns {Promise<object>}
   */
  static async create(userData) {
    try {
      const { email, password, name, role = 'user' } = userData;
      const result = await db.query(
        'INSERT INTO t_user (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, password, name, role]
      );
      return result.rows[0];
    } catch (error) {
      console.error('DB Error:', error);
      throw error;
    }
  }

  /**
   * 사용자 업데이트
   * @param {number} id
   * @param {object} updateData
   * @returns {Promise<object>}
   */
  static async update(id, updateData) {
    try {
      const fields = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
      const values = Object.values(updateData);

      const result = await db.query(
        `UPDATE t_user SET ${fields}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`,
        [...values, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('DB Error:', error);
      throw error;
    }
  }

  /**
   * 사용자 삭제
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM t_user WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('DB Error:', error);
      throw error;
    }
  }
}

module.exports = User;
