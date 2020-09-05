const express = require("express");
const urls = require("./api/urls");

const router = express.Router();

router.use("/urls", urls);

router.get("/", (req, res) => {
  res.send("Root");
});

module.exports = router;
