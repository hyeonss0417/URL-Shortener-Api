const mysql = require("mysql2/promise");
const dbconfig = {
  host: "localhost",
  user: "root",
  password: "phaphaya",
  database: "my_db",
};

let pool;

const getPool = () => {
  if (pool === undefined) {
    pool = mysql.createPool(dbconfig);
  }
  return pool;
};

module.exports = { getPool };
