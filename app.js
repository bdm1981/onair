var express = require("express");
var app = express();
var server = require("http").createServer(app);
var bodyParser = require("body-parser");
var Promise = require("bluebird");
var Client = require("node-xmpp-client");
var wpi = require("wiring-pi");
var fs = require("fs");
var io = require("socket.io")(server);
var path = require("path");
var config = require("./config.js");

wpi.setup("gpio");
var pin = 17;
wpi.pinMode(pin, wpi.OUTPUT);

var options = {
  jid: config.JID,
  password: config.PASSWORD,
  host: config.HOST,
  reconnect: true
};

if (config.MODE == "XMPP") {
  var client = new Client(options);

  client.on("online", function() {
    statusUpdate({ client: "online", error: null, statusText: null });
    client.send(
      new Client.Stanza("presence", {})
        .c("show")
        .t("chat")
        .up()
        .c("status")
        .t("")
    );
  });

  client.on("error", function(error) {
    console.log("error: ", error);
    statusUpdate({ client: "offline", error: error, statusText: null });
  });

  client.on("stanza", function(stanza) {
    var words;

    fs.readFile(path.resolve(__dirname, "./keywords.json"), function(
      err,
      data
    ) {
      if (err) {
        return console.log(err);
      }
      data = JSON.parse(data);
      words = data.words;
      // only listen to presence updates for the JID we are watching
      if (
        stanza.attrs.from.indexOf(config.MONITOR) >= 0 &&
        stanza.is("presence")
      ) {
        // get the status elemnt
        var status = stanza.getChildText("status");

        // check to make sure the status isn't null
        if (status) {
          status = status.toLowerCase();
          status = status.replace(/^\s+|\s+$/g, "");
        }

        // light status
        var light = false;
        // loop through all words to see if the status matches
        for (var i in words) {
          word = words[i].toLowerCase();
          // compare the status against the word list
          if (status && status.indexOf(word) > -1) {
            light = true;
            break;
          }
        }

        if (light) {
          console.log("enable onair light");
          wpi.digitalWrite(17, 1);
          statusUpdate({ client: "online", error: null, statusText: status });
          io.emit("broadcast", { status: status, light: "on" });
        } else {
          console.log("disable onair light");
          wpi.digitalWrite(17, 0);
          statusUpdate({ client: "online", error: null, statusText: status });
          io.emit("broadcast", { status: status, light: "off" });
        }
      }
    });
  });
}

function statusUpdate(status) {
  status.timestamp = Date.now();
  status.mode = config.MODE;
  status.monitor = config.MONITOR;
  fs.writeFile("./status.json", JSON.stringify(status), function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("Status saved");
  });
}

var onair = require("./src/routes/onair");

var port = 3000;

// Jade Setup
app.set("views", "./src/views");
app.set("view engine", "jade");

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", onair);

server.listen(port, function(err) {
  console.log("running server on port " + port);
});
