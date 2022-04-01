const authorPopulate = require("./author");
const downvotePopulate = require("./downvote");
const upvotePopulate = require("./upvote");

const commentPopulate = {
  path: "comments",
  select: ["content", "author", "upvotes", "downvotes", "slug", "anonymous"],
  populate: [authorPopulate, upvotePopulate, downvotePopulate],
};

module.exports = commentPopulate;
