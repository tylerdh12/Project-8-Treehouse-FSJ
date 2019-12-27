var express = require("express");
var router = express.Router();
const urlParams = "?page=1&limit=12";

/* GET home page. */
router.get("/", function(req, res) {
  res.redirect("books/" + urlParams);
});

module.exports = router;
