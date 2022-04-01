const YAML = require("yamljs");

const get = YAML.load("swagger/paths/profile/get.yaml");
const put = YAML.load("swagger/paths/profile/put.yaml");
const remove = YAML.load("swagger/paths/profile/delete.yaml");

const profilePathsExport = {
  ...get,
  ...put,
  ...remove,
};

module.exports = profilePathsExport;
