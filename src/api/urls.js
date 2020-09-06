require("../env");
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
 *  urls:
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
 *            created_date:
 *                    type: date
 *                    description: 단축 URL이 생긴 시간.
 *  url_logs:
 *        type: object
 *        properties:
 *            id:
 *                    type: number
 *                    description: log의 id
 *            url_id:
 *                    type: number
 *                    description: 호출된 url의 id
 *            call_date:
 *                    type: date
 *                    description: 호출된 시간
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
  const getOriginUrlSql = `SELECT url_id, origin_url from urls WHERE short_key = ?`;
  const createLogSql = `INSERT INTO url_logs (url_id) VALUES (?)`;

  const [rows] = await res.conn.query(getOriginUrlSql, shortKey);

  if (isEmptyResult(rows)) {
    return next(new CustomError("NO_RESULT", 404, "This url does not exist."));
  } else {
    await res.conn.query(createLogSql, rows[0].url_id);
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
 *                       short_url:
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
  res.status(200).json({
    short_url: `${process.env.DOMAIN_NAME}:${process.env.PORT}/${newKey}`,
  });
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
 *                       origin_url:
 *                          type: string
 *                          example: https://google.com
 *                       created_date:
 *                          type: date
 *                          example: 2020-09-06T10:39:29.000Z
 *                       short_url:
 *                          type: string
 *                          example: domain-name/urls/1CiFQ9
 *                       call_count:
 *                          type: number
 *                          example: 2
 *                       call_logs:
 *                          type: list
 *                          example: [2020-09-06T10:39:29.000Z, 2020-09-06T10:39:39.000Z, 2020-09-06T10:39:40.000Z]
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
  const getUrlInfoSql = `SELECT url_id, origin_url, created_date 
                          FROM urls WHERE short_key = ?`;
  const getUrlLogsSql = `SELECT call_date FROM url_logs WHERE url_id = ?`;

  const [urlInfoRows] = await res.conn.query(getUrlInfoSql, shortKey);
  if (isEmptyResult(urlInfoRows)) {
    return next(new CustomError("NO_RESULT", 404, "This url does not exist."));
  }

  const { url_id, origin_url, created_date } = urlInfoRows[0];
  const [logRows] = await res.conn.query(getUrlLogsSql, url_id);
  res.status(200).json({
    origin_url,
    created_date,
    short_url: `${process.env.DOMAIN_NAME}:${process.env.PORT}/${shortKey}`,
    call_count: logRows.length,
    call_logs: logRows.map((item) => item.call_date),
  });
});

module.exports = urls;
