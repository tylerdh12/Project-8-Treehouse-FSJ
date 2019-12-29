var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var routes = require("./routes/index");
var books = require("./routes/books");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);
app.use("/*books/", books);
app.get("/*books/", function(req, res) {
  res.redirect("/");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).render("404", {
    status: 404,
    statusMessage: "Page Not Found",
    statusMessage: "Page Not Found",
    errorMessage: "We were unable to find what you were looking for!"
  });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("500", {
    status: 500,
    statusMessage: "Internal Server Error",
    errorMessage:
      "There has been an Internal Server Error. If this issue persists please contact the developers to help resolve this issue."
  });
});

module.exports = app;
