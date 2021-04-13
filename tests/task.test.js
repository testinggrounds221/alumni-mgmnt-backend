const request = require("supertest");
const app = require("../src/app");
const jwt = require("jsonwebtoken");
const Task = require("../src/models/task");
const mongoose = require("mongoose");

const {
  userObjectID,
  userOne,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setUpDatabase,
} = require("./fixtures/db");
beforeEach(setUpDatabase);

test("should create Task", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ description: "Test task" })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBe(false);
});

test("Should get tasks by users", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body).toHaveLength(2);
});

test("Should not be able to delete others task", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const task = Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
