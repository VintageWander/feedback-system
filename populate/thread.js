const creatorPopulate = require("./creator.js");

const threadPopulate = {
  path: "thread",
  select: ["topic", "description", "slug", "creator", "upvotes", "downvotes"],
  populate: creatorPopulate,
};

module.exports = threadPopulate;
