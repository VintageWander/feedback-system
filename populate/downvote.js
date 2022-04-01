const downvotePopulate = {
  path: "downvotes",
  select: ["email", "username", "role", "slug"],
};

module.exports = downvotePopulate;
