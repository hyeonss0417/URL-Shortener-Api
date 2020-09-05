const express = require("express");
const bodyParser = require("body-parser");
const timeout = require("connect-timeout");
const {
  serverErrorHandler,
  dbConnectionHandler,
} = require("./src/customMiddleware");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const swaggerOptions = require("./config/swagger.def");
const urls = require("./src/api/urls");
const router = require("./src/router");

const app = express();
app.set("port", process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(timeout(8000));
app.use(dbConnectionHandler);

app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerJSDoc(swaggerOptions))
);

app.use("/", router);

app.use(serverErrorHandler);

app.listen(app.get("port"), () => {
  console.log("Express server listening on port " + app.get("port"));
});

module.exports = app;
