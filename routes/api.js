"use strict";

const mongoose = require("mongoose");
const Thread = require("../models/Thread");
const Reply = require("../models/Reply");

module.exports = function (app) {
  // MongoDB database connection string
  const uri =
    "mongodb+srv://" +
    process.env.DB_USER +
    ":" +
    process.env.DB_PASSWORD +
    "@" +
    process.env.CLUSTER +
    "/" +
    process.env.DB +
    "?retryWrites=true&w=majority&appName=" +
    process.env.APP_NAME;

  // Connect to the MongoDB database
  mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));

  // Route for creating a new thread
  app.route("/api/threads/:board").post((req, res) => {
    const { text, delete_password } = req.body;
    const board = req.params.board;

    const newThread = new Thread({
      text,
      delete_password,
      board,
    });

    newThread
      .save()
      .then((thread) => {
        res.status(201).json(thread);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: "Server error" });
      });
  });

  // Route for retrieving the 10 most recent threads with 3 replies each
  app.route("/api/replies/:board").get((req, res) => {
    const { board } = req.params;

    Thread.find({ board })
      .sort({ bumped_on: -1 })
      .limit(10)
      .populate({
        path: "replies",
        options: {
          sort: { created_on: -1 },
          limit: 3,
        },
      })
      .exec((err, thread) => {
        if (err) {
          console.log(err);
          res.status(500).json({ error: "Server error" });
        } else {
          res.json(thread);
        }
      });
  });

  // Route for creating a new reply
  app.route("/api/replies/:board").post((req, res) => {
    const { thread_id, text, delete_password } = req.body;
    const board = req.params.board;

    const newReply = new Reply({
      text,
      delete_password,
      thread_id,
      board,
    });

    Thread.findById(thread_id, (err, thread) => {
      if (err || !thread) {
        res.status(400).json({ error: "Thread not found" });
      }

      newReply.save((err, reply) => {
        if (err) {
          return res.status(500).json({ error: "Server error" });
        }

        thread.replies.push(reply);
        thread.bumped_on = new Date();

        thread.save((err, updatedThread) => {
          if (err) {
            return res.status(500).json({ error: "Server error" });
          }

          res.json(reply);
        });
      });
    });
  });

  // Route for retrieving a single thread with all its replies
  app.route("/api/replies/:board").get((req, res) => {
    const { board } = req.params;
    const { thread_id } = req.query;

    Thread.findById(thread_id)
      .where("board")
      .equals(board)
      .populate({
        path: "replies",
        options: {
          sort: { created_on: -1 },
          select: "-reported -delete_password",
        },
      })
      .select("-reported -delete_password")
      .exec((err, thread) => {
        if (err || !thread) {
          console.log(err);
          res.status(400).json({ error: "Thread not found" });
        } else {
          res.json(thread);
        }
      });
  });
};
