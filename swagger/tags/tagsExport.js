const YAML = require("yamljs");

const AuthenticationTag = YAML.load("swagger/tags/Authentication.yaml");
const CommentTag = YAML.load("swagger/tags/Comment.yaml");
const PostTag = YAML.load("swagger/tags/Post.yaml");
const ThreadTag = YAML.load("swagger/tags/Thread.yaml");
const My_ProfileTag = YAML.load("swagger/tags/My_Profile.yaml");
const ManageTag = YAML.load("swagger/tags/Manage.yaml");

const tagsExport = [
  AuthenticationTag,
  My_ProfileTag,
  ManageTag,
  ThreadTag,
  PostTag,
  CommentTag,
];

module.exports = tagsExport;
