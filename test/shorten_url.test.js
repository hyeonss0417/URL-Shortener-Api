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

//##### Shorten URL
describe("[Test] Shorten URL", () => {
  it("POST / 200 - Success", function (done) {
    this.timeout(2000);
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

  it("POST / 400 - Not Url Pattern", function (done) {
    this.timeout(2000);
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

  it("POST / 400 - Too long Url", function (done) {
    this.timeout(2000);
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
describe("[Test] Redirect URL", () => {
  it("GET /:key 200 - Redirection", function (done) {
    this.timeout(2000);
    assertRedirection(done);
  });

  it("GET /:key 404 -  Nonexistent URL", function (done) {
    this.timeout(2000);
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
describe("[Test] URL Statistic", () => {
  it("GET /:key/stat 200 - call_count should be 1", function (done) {
    this.timeout(2000);
    assertUrlStatistics(done);
  });

  it("Call Again", function (done) {
    this.timeout(2000);
    assertRedirection(done);
  });

  it("GET /:key/stat 200 - call_count should be 2", function (done) {
    this.timeout(2000);
    assertUrlStatistics(done);
  });

  it("Call Again", function (done) {
    this.timeout(2000);
    assertRedirection(done);
  });

  it("GET /:key/stat 200 - call_count should be 3", function (done) {
    this.timeout(2000);
    assertUrlStatistics(done);
  });

  it("GET /:key/stat 404 - Nonexistent URL", function (done) {
    this.timeout(2000);
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
