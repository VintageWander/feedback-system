const crypto = require("crypto");

const deepClone = require("../utils/deepClone");

const threadDTO = (thread) => {
  const clonedThread = deepClone(thread);
  clonedThread.posts.forEach((post) => {
    if (post.anonymous) {
      post.author.username = "Anonymous";
      post.author.email = `${crypto.randomBytes(5).toString("hex")}@mail.com`;
    }
  });
  return clonedThread;
};

module.exports = threadDTO;
