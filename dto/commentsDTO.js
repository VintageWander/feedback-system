const crypto = require("crypto");

const deepClone = require("../utils/deepClone");

const commentsDTO = (comments) => {
  const filteredComments = deepClone(comments);
  filteredComments.forEach((comment) => {
    if (comment.post.anonymous) {
      comment.post.author.username = "Anonymous";
      comment.post.author.email = `${crypto
        .randomBytes(5)
        .toString("hex")}@mail.com`;
    }
    if (comment.anonymous) {
      comment.author.username = "Anonymous";
      comment.author.email = `${crypto
        .randomBytes(5)
        .toString("hex")}@mail.com`;
    }
  });
  return filteredComments;
};

module.exports = commentsDTO;
