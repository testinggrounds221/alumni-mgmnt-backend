const mongoose = require("mongoose");

const connectionURL = process.env.MONGO_URL;
console.log(process.env.MONGO_URL)
const databaseName = "task-manager-api";

mongoose.connect(connectionURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
