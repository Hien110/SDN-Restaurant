require("dotenv").config();
const { promisify } = require("util");
const crypto = require("crypto");
const randomBytesAsync = promisify(crypto.randomBytes);
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendMail } = require("../../config/email");
const host = process.env.HOST;

// [POST] => /sign-up
exports.postSignUp = async (req, res, next) => {
  try {
    const { email, password, phone, confirmPassword } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.redirect("/login");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      phoneNumber: "0",
      role: "RESOWNER",
      status: "ACTIVE",
    });

    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// [POST] => /sign-in
exports.postSignIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.render("login", { error: "Account does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", {
        error: "Email or password is incorrect",
      });
    }
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("login", { error: "Something went wrong, please try again" });
  }
};

// [GET] => getReset
exports.getReset = async (req, res, next) => {
  res.render("reset-password");
};

// [POST] => postReset

exports.postReset = async (req, res, next) => {
  try {
    const buffer = await randomBytesAsync(32);
    const resetToken = buffer.toString("hex");
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      console.log("No account with that email found.");
      return res.redirect("/reset-password");
    }

    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await sendMail(req.body.email, resetToken);
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.redirect("/reset-password");
  }
};

// [GET] => getNewPassword
exports.getNewPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const responseUser = await User.findOne({
      resetToken: resetToken,
    });
    if (!responseUser) {
      return res.redirect("/");
    }
    res.render("new-password", { userId: responseUser._id.toString() });
  } catch (err) {
    console.error(err);
    res.redirect("/reset-password");
  }
};

// [POST] => postNewPassword
exports.postNewPassword = async (req, res, next) => {
  try {
    const { userId, password } = req.body;
    console.log("userId", userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect("/login");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    await user.save();
    alert("Password reset successfully!");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
};
// [POST] => postLogout
exports.postLogout = async (req, res, next) => {
  req.session.destroy((err) => {
    console.error(err);
    res.redirect("/login");
  });
};
