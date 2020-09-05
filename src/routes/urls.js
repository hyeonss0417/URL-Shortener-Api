const express = require("express");
const timeout = require("connect-timeout");
const {
  isValidUrl,
  isEmptyResult,
  checkUrlLength,
  getUniqueUrlKey,
} = require("../utils");
const CustomError = require("../customError");

const urls = express.Router();

urls.get("/:key", async (req, res, next) => {
  const shortKey = req.params.key;
  const getOriginUrlSql = `SELECT origin_url from urls WHERE short_key = ?`;
  const increaseCallCountSql = `UPDATE urls SET call_count = call_count + 1 WHERE short_key = ?`;

  const [rows] = await res.conn.query(getOriginUrlSql, shortKey);

  if (isEmptyResult(rows)) {
    return next(new CustomError("NO_RESULT", 400, "This url does not exist."));
  } else {
    await res.conn.query(increaseCallCountSql, shortKey);
    res.redirect(rows[0].origin_url);
  }
});

urls.post("/", timeout(3000), async (req, res, next) => {
  const originUrl = req.body.url;
  const insertSql = "INSERT INTO urls (origin_url, short_key) VALUES (?, ?)";

  if (!isValidUrl(originUrl)) {
    return next(new CustomError("WRONG_REQUEST", 400, "This is not url."));
  }

  if (!checkUrlLength(originUrl)) {
    return next(
      new CustomError(
        "WRONG_REQUEST",
        400,
        "Url is too long. (over 500 in length)"
      )
    );
  }

  const newKey = await getUniqueUrlKey(res.conn);
  if (newKey === "") {
    return next(
      new CustomError("GENERIC", 500, "Couldn't get unique url key.")
    );
  }

  res.conn.query(insertSql, [originUrl, newKey]);
  res.status(200).json({ shortUrl: `localhost:3000/${newKey}` });
});

urls.get("/:key/stat", async (req, res, next) => {
  const shortKey = req.params.key;
  const sql = `SELECT call_count from urls WHERE short_key = ?`;
  const [rows] = await res.conn.query(sql, shortKey);

  if (isEmptyResult(rows)) {
    return next(new CustomError("NO_RESULT", 400, "This url does not exist."));
  }
  res.status(200).json({ call_count: rows[0].call_count });
});

module.exports = urls;
