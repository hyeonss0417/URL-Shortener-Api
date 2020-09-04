const chai = require("chai");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);
const expect = chai.expect;

const app = require("../src/server");

describe("[Test] Shorten URL", () => {
  const testUrl = "https://www.google.co.kr/";
  let shortKey;

  it("POST /register 400 - Wrong Url", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .post("/register")
      .send({ url: "://www.google.co.kr/" })
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body.message).to.be.equal("This is not url.");
        done();
      });
  });

  it("POST /register 400 - Too long Url", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .post("/register")
      .send({
        url:
          "http://www.google.co.kr/jfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfasjfdsoifjsdafkldsjfoiqejflkejfoijfas",
      })
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body.message).to.be.equal(
          "Url is too long. (over 500 in length)"
        );
        done();
      });
  });

  it("POST /register 200", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .post("/register")
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

  it("GET /:key/status 200 - 0", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .get(`/${shortKey}/status`)
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.call_count).to.be.equal(0);
        done();
      });
  });

  it("GET /:key 200 (302)", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .get(`/${shortKey}`)
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res.redirects[0]).to.be.equal(testUrl);
        done();
      });
  });

  it("GET /:key 400 - Wrong Url", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .get(`/iwejgklnbqwjiroqjfklejdoisj`)
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body.message).to.be.equal("This url does not exist.");
        done();
      });
  });

  it("GET /:key/status 200 - 1", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .get(`/${shortKey}/status`)
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.call_count).to.be.equal(1);
        done();
      });
  });

  it("GET /:key one more", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .get(`/${shortKey}`)
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res.redirects[0]).to.be.equal(testUrl);
        done();
      });
  });

  it("GET /:key/status 200 - 2", function (done) {
    this.timeout(2000);
    chai
      .request(app)
      .get(`/${shortKey}/status`)
      .end((err, res) => {
        expect(err).to.be.not.ok;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.call_count).to.be.equal(2);
        done();
      });
  });
});
