const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const compression = require("compression");
const helmet = require("helmet");
const passport = require("passport");
const cors = require("cors");
const initMongo = require("./config/mongo");
require("dotenv").config()

// Import the db.js file for Mongoose connection
const db = require("./middleware/db"); // Adjust the path based on the location of your db.js file

const app = express();
// Init all other stuff
app.use(cors({ origin: "*" }));
app.use(passport.initialize());
app.use(compression());
app.use(helmet());
// for parsing json
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
app.use(bodyParser.json());
app.use("/public", express.static("public"));
// Set EJS as templating engine
app.set("view engine", "ejs");
app.use("/api", require("./routes"));
app.use(express.static("assets"));

const server = http.createServer(app);
// for parsing json

global.io = require('socket.io')(server, { cors: { origin: '*' } })
require("./controller/socket/index")();

// Serve the index.html file
app.get("/", (req, res) => {
  res.status(200).send("Hello");
});

server.listen(4000);

// Gracefully close the Mongoose connection when the Node process exits
process.on("SIGINT", () => {
  db.close(() => {
    console.log("Mongoose connection disconnected through app termination");
    process.exit(0);
  });
});

initMongo();
