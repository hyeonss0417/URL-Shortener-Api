require("../src/env");
const chai = require("chai");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);
const expect = chai.expect;

const app = require("../app");

const testUrl = "https://www.google.co.kr/";
const nonExistentKey = "iwejgklnbqwj";
const testStartTime = Date.now() - 1000;

let shortKey;
let call_cnt = 0;

const assertRedirection = (done) => {
  chai
    .request(app)
    .get(`/urls/${shortKey}`)
    .end((err, res) => {
      expect(err).to.be.not.ok;
      expect(res.redirects[0]).to.be.equal(testUrl);
      call_cnt++;
      done();
    });
};

const assertUrlStatistics = (done) => {
  chai
    .request(app)
    .get(`/urls/${shortKey}/stat`)
    .end((err, res) => {
      expect(err).to.be.not.ok;
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body.origin_url).to.be.deep.equal(testUrl);
      expect(new Date(res.body.created_date).getTime()).to.be.greaterThan(
        testStartTime
      );
      expect(res.body.short_url).to.be.equal(
        `${process.env.DOMAIN_NAME}:${process.env.PORT}/${shortKey}`
      );
      expect(res.body.call_count).to.be.equal(call_cnt);
      expect(res.body.call_logs).to.have.lengthOf(call_cnt);
      res.body.call_logs.forEach((call_date) => {
        expect(new Date(call_date).getTime()).to.be.greaterThan(testStartTime);
      });
      done();
    });
};

describe("[Test] URL Shortener API", () => {
  //##### Shorten URL
  context("POST /urls - Shorten URL", () => {
    it("should return 200.", function (done) {
      chai
        .request(app)
        .post("/urls")
        .send({ url: testUrl })
        .end((err, res) => {
          expect(err).to.be.not.ok;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.short_url).to.be.not.undefined;
          shortKey = res.body.short_url.split("/")[1];
          done();
        });
    });

    it("should return 400. (Not url pattern)", function (done) {
      chai
        .request(app)
        .post("/urls")
        .send({ url: "://www.google.co.kr/" })
        .end((err, res) => {
          expect(err).to.be.not.ok;
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body.error).to.be.equal("WRONG_REQUEST");
          done();
        });
    });

    it("should return 400. (Too long url)", function (done) {
      chai
        .request(app)
        .post("/urls")
        .send({
          url:
            "http://www.google.co.kr/jfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfas",
        })
        .end((err, res) => {
          expect(err).to.be.not.ok;
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body.error).to.be.equal("WRONG_REQUEST");
          done();
        });
    });
  });

  //##### Redirect URL
  context("GET /urls/:key - Redirect URL", () => {
    it("should return 200. (Redirection)", function (done) {
      assertRedirection(done);
    });

    it("should return 404. (Nonexistent URL)", function (done) {
      chai
        .request(app)
        .get(`/urls/${nonExistentKey}`)
        .end((err, res) => {
          expect(err).to.be.not.ok;
          expect(res).to.have.status(404);
          expect(res).to.be.json;
          expect(res.body.error).to.be.equal("NO_RESULT");
          done();
        });
    });
  });

  //#### Get URL Statistics
  context("GET /:key/stat - URL Statistic", () => {
    beforeEach("Visit the url.", function (done) {
      assertRedirection(done);
    });

    it("should return 200 (call_count should be 2)", function (done) {
      assertUrlStatistics(done);
    });

    it("should return 200 (call_count should be 3)", function (done) {
      assertUrlStatistics(done);
    });

    it("should return 200 (call_count should be 4)", function (done) {
      assertUrlStatistics(done);
    });

    it("GET /:key/stat 404 - Nonexistent URL", function (done) {
      chai
        .request(app)
        .get(`/urls/${nonExistentKey}/stat`)
        .end((err, res) => {
          expect(err).to.be.not.ok;
          expect(res).to.have.status(404);
          expect(res).to.be.json;
          expect(res.body.error).to.be.equal("NO_RESULT");
          done();
        });
    });
  });
});
