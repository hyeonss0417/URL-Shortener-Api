const express = require("express");
const timeout = require("connect-timeout");
const {
  isValidUrl,
  isEmptyResult,
  checkUrlLength,
  getUniqueUrlKey,
} = require("../utils");
const CustomError = require("../customError");

/**
 * @swagger
 * tags:
 *  name: URL
 * definitions:
 *  URL:
 *        type: object
 *        properties:
 *            url_id:
 *                    type: number
 *                    description: url 번호
 *            origin_url:
 *                    type: string
 *                    description: 단축 전 url
 *            short_key:
 *                    type: string
 *                    description: 원래 url에 접근하기 위한 key (단축된 url)
 *            call_count:
 *                    type: number
 *                    description: 단축 url이 눌린 횟수.
 */

const urls = express.Router();

/**
 * @swagger
 * /urls/{key}:
 *  get:
 *      tags: [URL]
 *      summary: 단축된 URL 링크에서 원래 URL로 리다이렉트
 *      parameters:
 *          - in: path
 *            type: string
 *            required: true
 *            default: 57Z4W
 *            name: key
 *            description: 단축된 URL 키 값
 *      responses:
 *          200:
 *              description: 리다이렉트 성공
 *              schema:
 *                  type: string
 *                  example: Redirect to "https://www.google.co.kr/"
 *          404:
 *              description: 존재하지 않는 URL 키 값으로 시도한 경우
 *              schema:
 *                  type: object
 *                  properties:
 *                       error:
 *                          type: string
 *                          example: NO_RESULT
 *                       message:
 *                          type: string
 *                          example: This url does not exist.
 */
urls.get("/:key", async (req, res, next) => {
  const shortKey = req.params.key;
  const getOriginUrlSql = `SELECT origin_url from urls WHERE short_key = ?`;
  const increaseCallCountSql = `UPDATE urls SET call_count = call_count + 1 WHERE short_key = ?`;

  const [rows] = await res.conn.query(getOriginUrlSql, shortKey);

  if (isEmptyResult(rows)) {
    return next(new CustomError("NO_RESULT", 404, "This url does not exist."));
  } else {
    await res.conn.query(increaseCallCountSql, shortKey);
    res.redirect(rows[0].origin_url);
  }
});

/**
 * @swagger
 * /urls:
 *  post:
 *      tags: [URL]
 *      summary: URL 단축
 *      parameters:
 *          - in: body
 *            name: url
 *            schema:
 *                type: object
 *                required:
 *                  - url
 *                properties:
 *                      url:
 *                          type: string
 *                          example: https://www.naver.com/
 *      responses:
 *          200:
 *              description: URL 등록 및 단축 URL 응답 성공
 *              schema:
 *                  type: object
 *                  properties:
 *                       shortUrl:
 *                          type: number
 *                          example: https://{domainName}/{newKey}
 *          400:
 *              description: URL 패턴에 맞지 않는 값을 입력했을 때 / URL 길이 제한을 초과했을 때 (500자)
 *              schema:
 *                  type: object
 *                  properties:
 *                       error:
 *                          type: string
 *                          example: WRONG_REQUEST
 *                       message:
 *                          type: string
 *                          example: This is not url. / The url is too long. (over 500 in length)
 *          500:
 *              description: 단축 Key 생성에 실패 했을 경우
 *              schema:
 *                  type: object
 *                  properties:
 *                       error:
 *                          type: string
 *                          example: GENERIC
 *                       message:
 *                          type: string
 *                          example: Couldn't get unique url key.
 */
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
        "The url is too long. (over 500 in length)"
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

/**
 * @swagger
 * /urls/{key}/stat:
 *  get:
 *      tags: [URL]
 *      summary: 단축된 URL 링크 관련 통계 정보
 *      parameters:
 *          - in: path
 *            type: string
 *            required: true
 *            default: 57Z4W
 *            name: key
 *            description: 단축된 URL 키 값
 *      responses:
 *          200:
 *              description: 통계 정보 조회 성공
 *              schema:
 *                  type: object
 *                  properties:
 *                       callCount:
 *                          type: number
 *                          example: 2
 *          404:
 *              description: 존재하지 않는 URL 키 값으로 시도한 경우
 *              schema:
 *                  type: object
 *                  properties:
 *                       error:
 *                          type: string
 *                          example: NO_RESULT
 *                       message:
 *                          type: string
 *                          example: This url does not exist.
 */
urls.get("/:key/stat", async (req, res, next) => {
  const shortKey = req.params.key;
  const sql = `SELECT call_count from urls WHERE short_key = ?`;
  const [rows] = await res.conn.query(sql, shortKey);

  if (isEmptyResult(rows)) {
    return next(new CustomError("NO_RESULT", 404, "This url does not exist."));
  }
  res.status(200).json({ callCount: rows[0].call_count });
});

module.exports = urls;
