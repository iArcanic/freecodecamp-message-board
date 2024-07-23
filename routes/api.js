"use strict";

let db = {};

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .post((req, res) => {
      const { board } = req.params;
      const { text, delete_password } = req.body;
      const newRecord = {
        _id: db[board]?.length || 0,
        text,
        created_on: Date(),
        bumped_on: Date(),
        reported: false,
        delete_password,
        replies: [],
      };
      if (db[board]) {
        db[board].push(newRecord);
      } else {
        db[board] = [newRecord];
      }
      res.json(newRecord);
    })
    .get((req, res) => {
      const { board } = req.params;
      let filteredArr = db[board].map((el) => ({
        _id: el._id,
        created_on: el.created_on,
        bumped_on: el.bumped_on,
        text: el.text,
        replies: el.replies.map((reply) => ({
          _id: reply._id,
          text: reply.text,
          created_on: reply.created_on,
        })),
      }));
      res.json(filteredArr);
    })
    .delete((req, res) => {
      const { board } = req.params;
      const { thread_id, delete_password } = req.body;
      let thread = db[board][thread_id];
      if (thread.delete_password === delete_password) {
        db[board] = [
          ...db[board].slice(0, thread_id),
          ...db[board].slice(thread_id + 1),
        ];
        res.send("success");
      } else {
        res.status(401).send("incorrect password");
      }
    })
    .put((req, res) => {
      const { board } = req.params;
      const { thread_id } = req.body;
      db[board][thread_id].reported = true;
      res.send("reported");
    });

  app
    .route("/api/replies/:board")
    .post((req, res) => {
      const { board } = req.params;
      const { text, delete_password, thread_id } = req.body;
      db[board][thread_id].bumped_on = Date();
      const newReply = {
        _id: db[board][thread_id].replies.length,
        text,
        created_on: Date(),
        delete_password,
        reported: false,
      };
      db[board][thread_id].replies.push(newReply);
      res.json(db[board][thread_id]);
    })
    .get((req, res) => {
      const { board } = req.params;
      const { thread_id } = req.query;
      let el = db[board][thread_id];
      let filteredThread = {
        _id: el._id,
        created_on: el.created_on,
        bumped_on: el.bumped_on,
        text: el.text,
        replies: el.replies.map((reply) => ({
          _id: reply._id,
          text: reply.text,
          created_on: reply.created_on,
        })),
      };
      console.log(filteredThread);
      res.json(filteredThread);
    })
    .put((req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id } = req.body;
      db[board][thread_id]["replies"][reply_id].reported = true;
      res.send("reported");
    })
    .delete((req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id, delete_password } = req.body;
      let thread = db[board][thread_id];
      if (thread.replies[reply_id].delete_password === delete_password) {
        thread.replies[reply_id].text = "[deleted]";
        res.send("success");
      } else {
        res.status(401).send("incorrect password");
      }
    });
};
