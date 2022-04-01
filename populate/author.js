const authorPopulate = {
  path: "author",
  select: ["username", "email", "role", "slug", "anonymous"],
};

module.exports = authorPopulate;
