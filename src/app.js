const express = require("express");
const cors = require("cors");
require("./db/mongoose");
// D:\Shreeram\Core_Coding\NodeJS\Others\mongo\mongoData
const userRouter = require("./routers/user");
//const taskRouter = require("./routers/task");
const app = express();

app.use(express.json());
app.options("*", cors());
//app.use(cors());
app.use(userRouter);
//app.use(taskRouter);

module.exports = app;
