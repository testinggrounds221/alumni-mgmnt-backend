const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");

const userSchema = mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, default: "Name" },
    userType: { type: Number, required: true, default: 2 },
    passOutYear: { type: Number, required: true, trim: true, default: "2020" },
    collegeId: { type: String, required: true, trim: true, default: "cl1" },
    departmentId: { type: String, required: true, trim: true, default: "d1" },
    companyName: {
      type: String,
      required: true,
      trim: true,
      default: "Honeywell",
    },
    companyRole: {
      type: String,
      required: true,
      trim: true,
      default: "Program Manager",
    },
    specalization: {
      type: String,
      required: true,
      trim: true,
      default: "Blockchain",
    },
    linkedIn: {
      type: String,
      required: true,
      trim: true,
      default: "www.google.com",
    },
    phoneNumber: {
      type: Number,
      required: true,
      trim: true,
      default: "123456",
    },

    authenticated: { type: Boolean, default: false },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      //unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
      // validate(value) {
      //   if (value.includes("password")) {
      //     throw new Error("Password not to contain the word password");
      //   }
      // },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// userSchema.virtual("tasks", {
//   ref: "Task",
//   localField: "_id",
//   foreignField: "owner",
// });

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = jwt.sign({ _id: user._id.toString() }, "imafullstackdeveloper");
  user.tokens = user.tokens.concat({ token });

  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to Login"); // Doing this purposefully
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to Login"); // Doing this purposefully
  }
  return user;
};

// Hashing passwords for security
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// userSchema.pre("remove", async function (next) {
//   const user = this;
//   await Task.deleteMany({ owner: user._id });
//   next();
// });
const User = mongoose.model("User", userSchema);

module.exports = User;
