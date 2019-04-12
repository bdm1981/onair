var express = require("express");
var router = express.Router();
var wpi = require("wiring-pi");
var fs = require("fs");
var path = require("path");
var config = require("../../config");

wpi.setup("gpio");

router.get("/", function(req, res) {
  fs.readFile(path.resolve(__dirname, "../../keywords.json"), function(
    err,
    data
  ) {
    if (err) {
      return console.log(err);
    }
    data = JSON.parse(data);
    res.render("index", {
      title: "On-Air",
      keywords: data.words,
      mode: config.MODE
    });
  });
});

router.get("/about", function(req, res) {
  res.render("about", { title: "On-Air: About" });
});

router.get("/contact", function(req, res) {
  res.render("contact", { title: "On-Air: Contact" });
});

router.get("/setup", function(req, res) {
  fs.readFile(path.resolve(__dirname, "../../keywords.json"), function(
    err,
    data
  ) {
    if (err) {
      return console.log(err);
    }
    data = JSON.parse(data);
    res.render("setup", {
      title: "On-Air: Setup",
      config: config,
      keywords: data.words
    });
  });
});

router.get("/light", function(req, res) {
  var state = req.query.state;
  if (state === "on") {
    wpi.digitalWrite(17, 1);
  } else if (state === "off") {
    wpi.digitalWrite(17, 0);
  } else if (state === "status") {
    res.json({ status: wpi.digitalRead(17) });
  }
  res.end();
});

router.post("/update", function(req, res) {
  var config = req.body.config;
  var keywords = req.body.keywords;

  config =
    "var config =" + JSON.stringify(config) + ";\nmodule.exports = config;";

  fs.writeFile(
    path.resolve(__dirname, "../../keywords.json"),
    JSON.stringify(keywords),
    function(err) {
      fs.writeFile(path.resolve(__dirname, "../../config.js"), config, function(
        err
      ) {
        console.log("config saved");
        res.json({ status: "success" });
      });
    }
  );
});

router.get("/status", function(req, res) {
  fs.readFile(path.resolve(__dirname, "../../status.json"), function(
    err,
    data
  ) {
    if (err) {
      return console.log(err);
    }
    data = JSON.parse(data);
    res.json(data);
  });
});

module.exports = router;
