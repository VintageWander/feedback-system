const crypto = require("crypto");

const deepClone = require("../utils/deepClone");

const threadsDTO = (threads) => {
  const filteredThreads = deepClone(threads);
  filteredThreads.forEach((thread) => {
    thread.posts.forEach((post) => {
      if (post.anonymous) {
        post.author.username = "Anonymous";
        post.author.email = `${crypto.randomBytes(5).toString("hex")}@mail.com`;
      }
    });
  });
  return filteredThreads;
};

module.exports = threadsDTO;
