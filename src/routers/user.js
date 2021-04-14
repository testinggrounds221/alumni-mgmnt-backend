const express = require("express");
const router = express.Router();
const multer = require("multer");
const { ObjectID, ObjectId } = require("mongodb");
const auth = require("../middleware/auth");
const cors = require('cors');
const User = require("../models/user");
const sharp = require("sharp");
const {
  sendWelcomeEmail,
  sendCancellationEmail,
} = require("../emails/accounts");

router.post("/users",cors(), async (req, res) => {
  const user = new User(req.body);
  const token = await user.generateAuthToken();
  console.log(user.firstName)

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.firstName);
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// auth is middleware
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.get("/users/emails",cors(), async (req, res) => {
  //const match = {};
  //const sort = {};
  try {
    // const tasks = await Task.find({ owner: req.user.id });
    const users = await User.find({},{email:1})
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ Error: "Invalid Field" });
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send();
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Upload A JPG"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({
        width: 250,
        height: 250,
      })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (err, req, res, next) => {
    return res.status(400).send({ Error: err.message });
  }
);

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    //  sendCancellationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    return res.status(500).send();
  }
});

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    return res.send(e);
  }
});

module.exports = router;
