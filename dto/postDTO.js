const crypto = require("crypto");

const deepClone = require("../utils/deepClone");

const postDTO = (post) => {
  const filteredPost = deepClone(post);

  if (filteredPost.anonymous) {
    filteredPost.author.username = "Anonymous";
    filteredPost.author.email = `${crypto
      .randomBytes(5)
      .toString("hex")}@mail.com`;
  }
  filteredPost.comments.forEach((comment) => {
    if (comment.anonymous) {
      comment.author.username = "Anonymous";
      comment.author.email = `${crypto
        .randomBytes(5)
        .toString("hex")}@mail.com`;
    }
  });
  return filteredPost;
};

module.exports = postDTO;
