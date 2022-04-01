const YAML = require("yamljs");

const register = YAML.load("swagger/paths/authentication/register.yaml");
const login = YAML.load("swagger/paths/authentication/login.yaml");
const refresh = YAML.load("swagger/paths/authentication/refresh.yaml");
const logout = YAML.load("swagger/paths/authentication/logout.yaml");
const check = YAML.load("swagger/paths/authentication/check.yaml");

const authenticationPathsExport = {
  ...register,
  ...login,
  ...refresh,
  ...logout,
  ...check,
};

module.exports = authenticationPathsExport;
