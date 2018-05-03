require('dotenv').config({path: process.cwd() + "/../.env/shared.test"})
const mongoose = require("mongoose");
const Inbox = require("../index");
const rights = require("../../../lib/rights");
const User = require("../../../models/user");
const chakram = require('chakram')

const mongoTest = require("../../../../mongo-test");
let mongoServer;

const login = async (opts) => {
  const response = await chakram.post("http://localhost:8080/api/users/login", {email: opts.email, password: opts.password})
  return response.body.jwt
}

before(done => {
  // mongoServer = mongoTest.before(done, `${__dirname}/db`, "feedbackly-cypress", mongoose);
  done()
});

after(() => {
 // mongoose.disconnect();
 // mongoServer.stop();


});

describe("Inbox get by id", async () => {
      const jwt = await login({email: "developer@feedbackly.com", password: "developer1234"})
      const params = { id: "5a1e23de111a6edb1d899334" };
      let response = await chakram.get('http://localhost:8080/api/v2/inbox/' + params.id, {headers: {'Authorization': 'JWT ' + jwt}})
      let body = response.body;
      console.log(body)
      it("should have a response with the same id", () => {
        console.log(body)
        body.id.should.equal(params.id)
        done()
      });
});
