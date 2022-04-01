const YAML = require("yamljs");

const post_get = YAML.load("swagger/paths/post/get.yaml");
const post_post = YAML.load("swagger/paths/post/post.yaml");
const post_put = YAML.load("swagger/paths/post/put.yaml");
const post_delete = YAML.load("swagger/paths/post/delete.yaml");
const post_getBySlug = YAML.load("swagger/paths/post/getBySlug.yaml");
const post_upvote = YAML.load("swagger/paths/post/upvote.yaml");
const post_downvote = YAML.load("swagger/paths/post/downvote.yaml");

const postPathsExport = {
  ...post_get,
  ...post_post,
  ...post_put,
  ...post_delete,
  ...post_getBySlug,
  ...post_upvote,
  ...post_downvote,
};

module.exports = postPathsExport;
