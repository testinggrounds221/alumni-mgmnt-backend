const express = require("express");
const router = express.Router();
const multer = require("multer");
const { ObjectID, ObjectId } = require("mongodb");
const auth = require("../middleware/auth");
const cors = require("cors");
const User = require("../models/user");
const sharp = require("sharp");
const {
  sendWelcomeEmail,
  sendCancellationEmail,
} = require("../emails/accounts");

router.post("/users", cors(), async (req, res) => {
  const user = new User(req.body);
  const token = await user.generateAuthToken();
  //console.log(user.firstName);

  try {
    await user.save();
    if (user.userType === 2) {
      sendWelcomeEmail(user.email, user.firstName);
    }

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", cors(), async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(401).send();
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
router.get("/users/me", cors(), auth, async (req, res) => {
  res.send(req.user);
});

router.get("/users/emails", cors(), async (req, res) => {
  //const match = {};
  //const sort = {};
  try {
    // const tasks = await Task.find({ owner: req.user.id });
    const users = await User.find({ userType: 2 }, { email: 1 });
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/users/all", cors(), async (req, res) => {
  console.log("Getting users...");
  try {
    const users = await User.find(
      { userType: 2 },
      {
        firstName: 1,
        email: 1,
        passOutYear: 1,
        departmentId: 1,
        collegeId: 1,
        companyName: 1,
        linkedIn: 1,
        authenticated: 1,
        userType: 1,
      }
    );
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/onlyauthcollege", cors(), async (req, res) => {
  console.log(`Getting users from ${req.body.collegeId}`);
  let filterParam = {};
  if (req.body.collegeId === "all") {
    filterParam = { userType: 2 };
  } else {
    filterParam = { userType: 2, collegeId: req.body.collegeId };
  }

  try {
    const users = await User.find(filterParam, {
      firstName: 1,
      email: 1,
      passOutYear: 1,
      departmentId: 1,
      collegeId: 1,
      companyName: 1,
      companyRole: 1,
      linkedIn: 1,
      authenticated: 1,
      userType: 1,
    });
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/users", cors(), async (req, res) => {
  //const match = {};
  //const sort = {};
  try {
    // const tasks = await Task.find({ owner: req.user.id });
    const users = await User.find({ userType: 2 });
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/filtersort", cors(), async (req, res) => {
  const filterBy = req.body.filterBy;
  const filterValue = req.body.filterValue;

  const sortBy = req.body.sortBy;
  const sortOrder = req.body.sortOrder;
  const showCollege = req.body.showCollege;

  let filterParam = {};
  if (showCollege === "all") {
    filterParam = {
      [filterBy]: filterValue,
      userType: 2,
    };
    console.log("Show All College");
  } else {
    filterParam = {
      [filterBy]: filterValue,
      userType: 2,
      collegeId: showCollege,
    };
  }

  try {
    // const results = await User.find({ filterBy: filterValue }).sort({
    //   filterBy: sortOrder,
    // });

    const results = await User.find(filterParam).sort({
      [sortBy]: sortOrder,
    });
    //console.log(results);
    res.send(results);
  } catch (e) {
    console.log(e.message);
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

router.post("/users/getbyid", cors(), async (req, res) => {
  const user = await User.findById(req.body.userID);
  try {
    res.send(user);
  } catch (e) {
    res.status(400).send();
  }
});

// TO AUTHENTICATE PROFILE
router.patch("/users/authprofile", cors(), async (req, res) => {
  const user = await User.findById(req.body.userID);

  try {
    user.authenticated = req.body.flag;
    await user.save();
    res.send(user);
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
