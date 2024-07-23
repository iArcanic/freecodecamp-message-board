const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { test, suite } = require("mocha");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("Creating a new thread: POST request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .post("/api/threads/test")
      .type("form")
      .send({ text: "text", delete_password: "password" })
      .set("content-type", "application/json")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.text, "text");
        done();
      });
  });
  test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .get("/api/threads/test")
      .set("content-type", "application/json")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isBelow(res.body.length, 10);
        done();
      });
  });
  test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", function (done) {
    chai
      .request(server)
      .delete("/api/threads/test")
      .send({ thread_id: 0, delete_password: "invalid_password" })
      .set("content-type", "application/json")
      .end(function (err, res) {
        assert.equal(res.status, 401);
        done();
      });
  });
  test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", function (done) {
    chai
      .request(server)
      .delete("/api/threads/test")
      .send({ thread_id: 0, delete_password: "password" })
      .set("content-type", "application/json")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });
  test("Reporting a thread: PUT request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .post("/api/threads/test")
      .type("form")
      .send({ text: "text", delete_password: "password" })
      .end();
    chai
      .request(server)
      .put("/api/threads/test")
      .send({ thread_id: 0 })
      .set("content-type", "application/json")
      .end(function (err, res) {
        assert.equal(res.text, "reported");
        done();
      });
  });
  test("Creating a new reply: POST request to /api/replies/{board}", function (done) {
    chai
      .request(server)
      .post("/api/replies/test")
      .send({ thread_id: 0, delete_password: "password", text: "hello" })
      .set("content-type", "application/json")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });
  test("Viewing a single thread with all replies: GET request to /api/replies/{board}", function (done) {
    chai
      .request(server)
      .get("/api/replies/test")
      .set("content-type", "application/json")
      .query({ thread_id: 0 })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.text, "text");
        done();
      });
  });
  test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", function (done) {
    chai
      .request(server)
      .post("/api/replies/test")
      .type("form")
      .send({ text: "text", delete_password: "password", thread_id: 0 })
      .end();
    chai
      .request(server)
      .delete("/api/replies/test")
      .send({
        delete_password: "incorrect_password",
        thread_id: 0,
        reply_id: 0,
      })
      .end(function (err, res) {
        assert.equal(res.status, 401);
        done();
      });
  });
  test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", function (done) {
    chai
      .request(server)
      .delete("/api/replies/test")
      .send({ delete_password: "password", thread_id: 0, reply_id: 0 })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });
  test("Reporting a reply: PUT request to /api/replies/{board}", function (done) {
    chai
      .request(server)
      .put("/api/replies/test")
      .send({ thread_id: 0, reply_id: 0 })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });
});
