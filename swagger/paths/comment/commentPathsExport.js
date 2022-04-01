const YAML = require("yamljs");

const comment_get = YAML.load("swagger/paths/comment/get.yaml");
const comment_post = YAML.load("swagger/paths/comment/post.yaml");
const comment_put = YAML.load("swagger/paths/comment/put.yaml");
const comment_delete = YAML.load("swagger/paths/comment/delete.yaml");
const comment_getBySlug = YAML.load("swagger/paths/comment/getBySlug.yaml");
const comment_upvote = YAML.load("swagger/paths/comment/upvote.yaml");
const comment_downvote = YAML.load("swagger/paths/comment/downvote.yaml");

const commentPathsExport = {
  ...comment_get,
  ...comment_post,
  ...comment_put,
  ...comment_delete,
  ...comment_getBySlug,
  ...comment_upvote,
  ...comment_downvote,
};

module.exports = commentPathsExport;
