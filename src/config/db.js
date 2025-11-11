// DB 연결 로직
// Sequelize (PostgreSQL), Mongoose (MongoDB) 등에 따라 구현

const config = require("./index");

// 예시: Sequelize를 사용하는 경우
// const { Sequelize } = require('sequelize');
//
// const sequelize = new Sequelize(
//   config.DB.DATABASE,
//   config.DB.USER,
//   config.DB.PASSWORD,
//   {
//     host: config.DB.HOST,
//     port: config.DB.PORT,
//     dialect: 'postgres',
//     logging: config.NODE_ENV === 'development' ? console.log : false,
//   }
// );
//
// module.exports = sequelize;

// 예시: 기본 pg 드라이버를 사용하는 경우
const { Pool } = require("pg");

const pool = new Pool({
  host: config.DB.HOST,
  port: config.DB.PORT,
  user: config.DB.USER,
  password: config.DB.PASSWORD,
  database: config.DB.DATABASE,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

module.exports = pool;
