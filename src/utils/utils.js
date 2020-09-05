const { getPool } = require("../../database/dbcon");
const pool = getPool();

const CustomError = require("../customError");

const dbConnectionHandler = async (req, res, next) => {
  try {
    var conn = await pool.getConnection(async (conn) => conn);
    res.conn = conn;
    await next();
  } catch (err) {
    return next(new CustomError("DB_ERROR", 500, "DB Error Occured."));
  } finally {
    conn.release();
  }
};

const serverErrorHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
    return res.status(err.status).send({
      error: err.code,
      description: err.message,
    });
  } else {
    console.error(err);
    return res.status(500).send({
      error: "GENERIC",
      description: "Something went wrong. Please try again or contact support.",
    });
  }
};

const throwServerErrorWhen = (condition, code, status, description) => {
  if (condition) throw new CustomError(code, status, description);
};

module.exports = {
  serverErrorHandler,
  dbConnectionHandler,
  throwServerErrorWhen,
};