const chai = require("chai");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);
const expect = chai.expect;

const app = require("../app");

const testUrl = "https://www.google.co.kr/";
const nonExistentKey = "iwejgklnbqwj";
let shortKey;
let call_cnt = 0;

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
        expect(res.body.shortUrl).to.be.not.undefined;
        shortKey = res.body.shortUrl.split("/")[1];
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
    chai
      .request(app)
      .get(`/urls/${shortKey}`)
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res.redirects[0]).to.be.equal(testUrl);
        call_cnt++;
        done();
      });
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

//#### URL Statistic
describe("[Test] URL Statistic", () => {
  it("GET /:key/stat 200 - call_count should be 1", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .get(`/urls/${shortKey}/stat`)
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.callCount).to.be.equal(call_cnt);
        done();
      });
  });

  it("Call Again", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .get(`/urls/${shortKey}`)
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res.redirects[0]).to.be.equal(testUrl);
        call_cnt++;
        done();
      });
  });

  it("GET /:key/stat 200 - call_count should be 2", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .get(`/urls/${shortKey}/stat`)
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.callCount).to.be.equal(call_cnt);
        done();
      });
  });

  it("Call Again", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .get(`/urls/${shortKey}`)
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res.redirects[0]).to.be.equal(testUrl);
        call_cnt++;
        done();
      });
  });

  it("GET /:key/stat 200 - call_count should be 3", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .get(`/urls/${shortKey}/stat`)
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.callCount).to.be.equal(call_cnt);
        done();
      });
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
