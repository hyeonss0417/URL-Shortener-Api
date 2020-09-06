require("../src/env");
const mysql = require("mysql2/promise");
const dbconfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DD_PASSWORD,
  database: process.env.DB_DATABASE,
};

let pool;

const getPool = () => {
  if (pool === undefined) {
    pool = mysql.createPool(dbconfig);
  }
  return pool;
};

module.exports = { getPool };
