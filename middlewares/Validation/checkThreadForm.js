const keepOneSpace = require("../../utils/keepOneSpace");
const isNumber = require("../../utils/isNumber");

const checkThreadForm = (req, res, next) => {
  const { topic, description, postDeadline, commentDeadline } = req.body;
  if (!topic || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  req.body.topic = keepOneSpace(topic.trim());
  if (!req.body.topic) {
    return res.status(400).json({ error: "Topic is empty" });
  }
  req.body.description = keepOneSpace(description.trim());
  if (!req.body.description) {
    return res.status(400).json({ error: "Description is empty" });
  }
  if (!postDeadline || !commentDeadline) {
    return res
      .status(400)
      .json({ error: "Both deadline for post and comment are required" });
  }
  if (!isNumber(postDeadline) || !isNumber(commentDeadline)) {
    return res.status(400).json({ error: "Deadlines must be a long number" });
  }
  const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  if (postDeadline < twoDaysFromNow || commentDeadline < twoDaysFromNow) {
    return res
      .status(400)
      .json({ error: "Post or comment deadline must be at least 2 days" });
  } else if (
    postDeadline > twoWeeksFromNow ||
    commentDeadline > twoWeeksFromNow
  ) {
    return res
      .status(400)
      .json({ error: "Post or comment deadline must be at most 2 weeks" });
  }
  next();
};

module.exports = checkThreadForm;
