const crypto = require("crypto");

const deepClone = require("../utils/deepClone");

const postsDTO = (posts) => {
  const filteredPosts = deepClone(posts);
  filteredPosts.forEach((post) => {
    if (post.anonymous) {
      post.author.username = "Anonymous";
      post.author.email = `${crypto.randomBytes(5).toString("hex")}@mail.com`;
    }
    post.comments.forEach((comment) => {
      if (comment.anonymous) {
        comment.author.username = "Anonymous";
        comment.author.email = `${crypto
          .randomBytes(5)
          .toString("hex")}@mail.com`;
      }
    });
  });
  return filteredPosts;
};

module.exports = postsDTO;
