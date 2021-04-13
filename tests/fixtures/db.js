const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const mongoose = require("mongoose");

const userOneID = new mongoose.Types.ObjectId();
const userTwoID = new mongoose.Types.ObjectId();

const userOne = {
  _id: userOneID,
  name: "Mike",
  email: "mikae@e.com",
  password: "pppppp11",
  tokens: [
    {
      token: jwt.sign({ _id: userOneID }, process.env.JWT_SECRET),
    },
  ],
};

const userTwo = {
  _id: userTwoID,
  name: "Ak",
  email: "ak@e.com",
  password: "pppppp11",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoID }, process.env.JWT_SECRET),
    },
  ],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "First Task",
  completed: false,
  owner: userOne._id,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Second Task",
  completed: true,
  owner: userOne._id,
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Third Task",
  completed: true,
  owner: userTwo._id,
};

const setUpDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneID,
  userOne,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setUpDatabase,
};
