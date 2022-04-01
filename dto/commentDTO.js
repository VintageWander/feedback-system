const crypto = require("crypto");

const deepClone = require("../utils/deepClone");

const commentDTO = (comment) => {
  const filteredComment = deepClone(comment);

  if (filteredComment.post.anonymous) {
    filteredComment.post.author.username = "Anonymous";
    filteredComment.post.author.email = `${crypto
      .randomBytes(5)
      .toString("hex")}@mail.com`;
  }

  if (filteredComment.anonymous) {
    filteredComment.author.username = "Anonymous";
    filteredComment.author.email = `${crypto
      .randomBytes(5)
      .toString("hex")}@mail.com`;
  }
  return filteredComment;
};

module.exports = commentDTO;
