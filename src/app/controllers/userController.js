require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendMail } = require("../../config/email");
const { genarateResetToken } = require("../../util");

// [POST] => /sign-up
exports.postSignUp = async (req, res, next) => {
  try {
    const { email, password, phone, confirmPassword } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.render("register", { message: "Account already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      phoneNumber: phone,
      role: "CUSTOMER",
      status: "INACTIVE",
    });
    user.resetToken = await genarateResetToken();
    user.resetTokenExpiration = Date.now() + 3600000;
    await sendMail(req.body.email, user.resetToken, true);
    res.render("login", {
      layout: "layouts/auth",
      title: "Login",
      message: "Please check your email to verify account",
    });
    await user.save();
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
      return res.render("login", {
        layout: "layouts/auth",
        title: "Login",
        message: "Account does not exist",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.render("login", {
        message: "Account is not active, try again",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", {
        render: "layouts/auth",
        title: "Login",
        message: "Invalid password",
      });
    }
    req.session.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    req.session.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("login", {
      render: "layouts/auth",
      title: "Login",
      message: "Something went wrong, please try again",
    });
  }
};

// [GET] => getReset
exports.getResetPassword = async (req, res, next) => {
  res.render("reset-password", { layout: "layouts/auth", title: "Reset" });
};

// [GET] => getNewPassword
exports.getNewPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      console.log("No account with that email found.");
      return res.redirect("/reset-password");
    }
    user.resetToken = await genarateResetToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await sendMail(req.body.email, user.resetToken, false);
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
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!responseUser) {
      return res.redirect("/");
    }
    res.render("new-password", {
      layout: "layouts/auth",
      title: "New Password",
      userId: responseUser._id.toString(),
    });
  } catch (err) {
    console.error(err);
    res.redirect("/reset-password");
  }
};

// [POST] => postNewPassword
exports.postNewPassword = async (req, res, next) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect("/login");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    alert("Password reset successfully!");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
};
// [get] => getVerify

exports.getVerify = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const user = await User.findOne({
      resetToken: resetToken,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      return res.redirect("/login");
    }
    user.status = "ACTIVE";
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.render("login", {
      layout: "layouts/auth",
      title: "Login",
      message: "Account is verify successfully, please login",
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
};
// [POST] => postLogout
exports.postLogout = async (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/login");
  });
};
