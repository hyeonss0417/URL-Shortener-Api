const path = require("path");

const swaggerDefinition = {
  info: {
    title: "URL Shortening API",
    version: "1.0.0",
    description: "Make you URL shorter",
  },
  basePath: "/",
  components: {
    res: {
      Forbidden: { description: "No Authorization" },
      NotFound: { description: "Not Found" },
    },
  },
  schemes: ["http"],
  // definitions: {
  //   Urls: {
  //     type: "object",
  //     properties: {
  //       url_id: { type: "number" },
  //       origin_url: { type: "string" },
  //       short_key: { type: "string" },
  //       call_count: { type: "number" },
  //     },
  //   },
  // },
};

module.exports = {
  swaggerDefinition,
  apis: [path.join(__dirname + "/../src/api/**/*.js")],
};
