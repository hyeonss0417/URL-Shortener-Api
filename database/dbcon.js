const dbconfig = require("../config/database.js");
const mysql = require("mysql2/promise");

let pool;

const getPool = () => {
  if (pool === undefined) {
    pool = mysql.createPool(dbconfig);
  }
  return pool;
};

module.exports = { getPool };
