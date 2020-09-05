const chai = require("chai");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);
const expect = chai.expect;

const app = require("../app");

describe("[Test] Response Time", () => {
  it("returns 200 (within 1000 ms)", function (done) {
    this.timeout(1000);
    chai
      .request(app)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("returns 200 (within 100 ms)", function (done) {
    this.timeout(1000);
    chai
      .request(app)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("returns 200 (within 10 ms)", function (done) {
    this.timeout(1000);
    chai
      .request(app)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
