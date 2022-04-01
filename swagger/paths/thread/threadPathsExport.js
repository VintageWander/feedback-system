const YAML = require("yamljs");

const thread_get = YAML.load("swagger/paths/thread/get.yaml");
const thread_post = YAML.load("swagger/paths/thread/post.yaml");
const thread_put = YAML.load("swagger/paths/thread/put.yaml");
const thread_delete = YAML.load("swagger/paths/thread/delete.yaml");
const thread_getBySlug = YAML.load("swagger/paths/thread/getBySlug.yaml");

const threadPathsExport = {
  ...thread_get,
  ...thread_post,
  ...thread_put,
  ...thread_delete,
  ...thread_getBySlug,
};

module.exports = threadPathsExport;
