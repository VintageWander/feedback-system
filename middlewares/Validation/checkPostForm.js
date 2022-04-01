const keepOneSpace = require("../../utils/keepOneSpace");
const isBool = require("../../utils/isBool");

const checkPostForm = (req, res, next) => {
  const { title, content, anonymous } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Content is required" });
  }
  req.body.title = keepOneSpace(title.trim());
  if (!req.body.title) {
    return res.status(400).json({ error: "Title is empty" });
  }
  req.body.content = keepOneSpace(content.trim());
  if (!req.body.content) {
    return res.status(400).json({ error: "Content is empty" });
  }
  req.body.anonymous = anonymous === "true";
  if (!isBool(req.body.anonymous)) {
    return res
      .status(400)
      .json({ error: "Anonymous is required and has to be a boolean" });
  }
  next();
};

module.exports = checkPostForm;
