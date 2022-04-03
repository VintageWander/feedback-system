const authorPopulate = {
  path: "author",
  select: ["username", "email", "role", "slug"],
};

module.exports = authorPopulate;
