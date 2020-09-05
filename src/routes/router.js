const express = require("express");
const timeout = require("connect-timeout");
const { getUniqueURLKey, isValidUrl } = require("../utils");
const { getPool } = require("../../database/dbcon");
const pool = getPool();

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Root");
});

router.post("/register", timeout(3000), async (req, res) => {
  const originUrl = req.body.url;
  const insertSql = "INSERT INTO urls (origin_url, short_key) VALUES (?, ?)";

  if (isValidUrl(originUrl) === false) {
    res.status(400).json({ message: "This is not url." });
    return;
  }

  if (originUrl.length > 500) {
    res.status(400).json({ message: "Url is too long. (over 500 in length)" });
    return;
  }

  try {
    var conn = await pool.getConnection(async (conn) => conn);
    const newKey = await getUniqueURLKey(conn);
    conn.query(insertSql, [originUrl, newKey]);
    res.status(200).json({ shortUrl: `localhost:3000/${newKey}` });
  } catch (err) {
    res.handleServerError(err);
  } finally {
    conn.release();
  }
});

router.get("/:key", async (req, res) => {
  const shortKey = req.params.key;
  const getOriginUrlSql = `SELECT origin_url from urls WHERE short_key = ?`;
  const increaseCallCount = `UPDATE urls SET call_count = call_count + 1 WHERE short_key = ?`;

  try {
    var conn = await pool.getConnection(async (conn) => conn);
    const [rows] = await conn.query(getOriginUrlSql, shortKey);

    if (rows.length === 0) {
      res.status(400).json({ message: "This url does not exist." });
    } else {
      await conn.query(increaseCallCount, shortKey);
      res.redirect(rows[0].origin_url);
    }
  } catch (err) {
    res.handleServerError(err);
  } finally {
    conn.release();
  }
});

router.get("/:key/status", async (req, res) => {
  const shortKey = req.params.key;
  const sql = `SELECT call_count from urls WHERE short_key = ?`;
  try {
    var conn = await pool.getConnection(async (conn) => conn);
    const [rows] = await conn.query(sql, shortKey);

    if (rows.length === 0) {
      res.status(400).json({ message: "This url does not exist." });
    } else {
      res.status(200).json({ call_count: rows[0].call_count });
    }
  } catch (err) {
    res.handleServerError(err);
  } finally {
    conn.release();
  }
});

module.exports = router;
