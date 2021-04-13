const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOneID, userOne, setUpDatabase } = require("./fixtures/db");

beforeEach(setUpDatabase);

test("Should Be able to signup users", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Ram",
      email: "ram@example.com",
      password: "hvhfowhfwfa",
    })
    .expect(201);

  // Added User to be sent User
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();
  expect(user.password).not.toBe("hvhfowhfwfa");
  expect(response.body).toMatchObject({
    user: {
      name: "Ram",
      email: "ram@example.com",
    },
    token: user.tokens[0].token,
  });
});

test("Should login existing users", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
  const user = await User.findById(userOneID);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should be unable to login non existent users", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "Nonexistent@not.com",
      password: "efoeurouo",
    })
    .expect(400);
});

test("Retrival of user profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get user profile for unauthorized User", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete user for authenticated user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneID);
  expect(user).toBeNull();
});

test("Should not delete non authenticated users", async () => {
  request(app).delete("/users/me").send().expect(401);
});

test("Should Upload Avatar", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);

  const user = await User.findById(userOneID);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid field", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ name: "AK" })
    .expect(200);

  const user = await User.findById(userOneID);
  expect(user.name).toEqual("AK");
});

test("Should  not update invalid field", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ "b-day": "AK" })
    .expect(400);
});
