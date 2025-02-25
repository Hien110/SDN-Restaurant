const bcrypt = require("bcryptjs");
const User = require("../models/User");

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
      return res.redirect("/login");
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.redirect("/login");
      }
      console.log(result);

      return res.redirect("/");
    });
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
};
