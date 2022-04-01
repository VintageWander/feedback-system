const threadPathsExport = require("./thread/threadPathsExport");
const postPathsExport = require("./post/postPathsExport");
const commentPathsExport = require("./comment/commentPathsExport");
const authenticationPathsExport = require("./authentication/authenticationPathsExport");
const profilePathsExport = require("./profile/profilePathsExport");
const managePathsExport = require("./manage/managePathsExport");

const pathsExport = {
  ...profilePathsExport,
  ...threadPathsExport,
  ...postPathsExport,
  ...commentPathsExport,
  ...authenticationPathsExport,
  ...managePathsExport,
};

module.exports = pathsExport;
