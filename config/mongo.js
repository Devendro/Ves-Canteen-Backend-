const mongoose = require("mongoose");
const loadModels = require("../models");
const DB_URL = "mongodb://localhost:27017/Canteen"
// module.exports = (callback) => {
module.exports = () => {
  const connect = () => {
    mongoose.Promise = global.Promise;

    mongoose.connect(
      DB_URL,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err) => {
        let dbStatus = "";
        if (err) {
          dbStatus = `*    Error connecting to DB: ${err}\n****************************\n`;
        }
        dbStatus = `*    DB Connection: OK\n****************************\n`;
        if (process.env.NODE_ENV !== "test") {
          // Prints initialization
          console.log("****************************");
          console.log("*    Starting Server");
          console.log(`*    Port: ${4000}`);
          console.log(`*    Database: MongoDB`);
          console.log(dbStatus);
        }
        // Call the callback function when mongoose connects
        // callback();
      }
    );
    mongoose.set('useCreateIndex', true)
    // mongoose.set('useFindAndModify', false)
  };
  connect();

  mongoose.connection.on("error", console.log);
  mongoose.connection.on("disconnected", connect);

  loadModels();
};
