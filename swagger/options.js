const YAML = require("yamljs");

const schemasExport = require("./schemas/schemasExport");
const tagsExport = require("./tags/tagsExport");
const pathsExport = require("./paths/pathsExport");

const options = {
  openapi: "3.0.0",
  info: {
    title: "Feedback System API",
    version: "1.0.0",
    description: "API for feedback system",
  },
  apis: ["./routes/*.js"],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: schemasExport,
  },
  tags: tagsExport,
  paths: pathsExport,
};

module.exports = options;
