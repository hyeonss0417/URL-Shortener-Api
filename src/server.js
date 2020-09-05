const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes/router");
const timeout = require("connect-timeout");
const {
  serverErrorHandler,
  dbConnectionHandler,
} = require("./customMiddleware");

const app = express();
app.set("port", process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(timeout(8000));
app.use(dbConnectionHandler);

app.use("/", router);

app.use(serverErrorHandler);

app.listen(app.get("port"), () => {
  console.log("Express server listening on port " + app.get("port"));
});

module.exports = app;
