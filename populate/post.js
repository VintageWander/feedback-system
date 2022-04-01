const authorPopulate = require("./author");
const downvotePopulate = require("./downvote");
const upvotePopulate = require("./upvote");

const postPopulate = {
  path: "posts",
  select: [
    "title",
    "content",
    "slug",
    "anonymous",
    "author",
    "upvotes",
    "downvotes",
  ],
  populate: [authorPopulate, upvotePopulate, downvotePopulate],
};

module.exports = postPopulate;
