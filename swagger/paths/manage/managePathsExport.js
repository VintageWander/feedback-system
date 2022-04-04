const YAML = require("yamljs");

const get_threads = YAML.load("swagger/paths/manage/get_threads.yaml");
const get_thread = YAML.load("swagger/paths/manage/get_thread.yaml");
const put_thread = YAML.load("swagger/paths/manage/put_thread.yaml");
const delete_thread = YAML.load("swagger/paths/manage/delete_thread.yaml");

const get_posts = YAML.load("swagger/paths/manage/get_posts.yaml");
const get_post = YAML.load("swagger/paths/manage/get_post.yaml");
const delete_post = YAML.load("swagger/paths/manage/delete_post.yaml");

const export_csv = YAML.load("swagger/paths/manage/export_csv.yaml");
const export_attachments = YAML.load(
  "swagger/paths/manage/export_attachments.yaml"
);

const get_comments = YAML.load("swagger/paths/manage/get_comments.yaml");
const get_comment = YAML.load("swagger/paths/manage/get_comment.yaml");
const delete_comment = YAML.load("swagger/paths/manage/delete_comment.yaml");

const get_users = YAML.load("swagger/paths/manage/get_users.yaml");
const get_user = YAML.load("swagger/paths/manage/get_user.yaml");
const put_user = YAML.load("swagger/paths/manage/put_user.yaml");
const delete_user = YAML.load("swagger/paths/manage/delete_user.yaml");

const managePathsExport = {
  ...get_threads,
  ...get_thread,
  ...put_thread,
  ...delete_thread,
  ...get_posts,
  ...get_post,
  ...export_csv,
  ...export_attachments,
  ...delete_post,
  ...get_comments,
  ...get_comment,
  ...delete_comment,
  ...get_users,
  ...get_user,
  ...put_user,
  ...delete_user,
};

module.exports = managePathsExport;
