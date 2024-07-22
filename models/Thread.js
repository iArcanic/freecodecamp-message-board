const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Reply = require("./Reply");

const threadSchema = new Schema({
  board: { type: String, required: true },
  text: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  delete_password: { type: String, required: true },
  replies: [Reply.schema],
});

const Thread = mongoose.model("Thread", threadSchema);

module.exports = Thread;
