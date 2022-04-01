const YAML = require("yamljs");

const Thread = YAML.load("swagger/schemas/Thread.yaml");
const User = YAML.load("swagger/schemas/User.yaml");
const Post = YAML.load("swagger/schemas/Post.yaml");
const Comment = YAML.load("swagger/schemas/Comment.yaml");

const schemasExport = {
  ...User,
  ...Thread,
  ...Post,
  ...Comment,
};

module.exports = schemasExport;
