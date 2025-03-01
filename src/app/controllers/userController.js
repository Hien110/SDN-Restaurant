require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendMail } = require("../../config/email");
const { genarateResetToken } = require("../../util");

const cloudinary = require("../../config/cloudinary/index.js");
const multer = require("multer");
const fs = require("fs");
const stream = require("stream");

const storage = multer.memoryStorage();

exports.upload = multer({ storage: storage });

// [POST] => /sign-up
exports.postSignUp = async (req, res, next) => {
  try {
    const { email, password, phone, confirmPassword } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.render("register", {
        layout: "layouts/auth",
        title: "register",
        error: "Email đã được đăng kí",
      });
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
      message: "Hãy kiểm tra email của bạn để xác thực tài khoản",
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
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("login", {
        layout: "layouts/auth",
        title: "Login",
        error: "Tài khoản không tồn tại",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.render("login", {
        layout: "layouts/auth",
        title: "Login",
        error: "Tài khoản của bạn chưa kích hoạt",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", {
        layout: "layouts/auth",
        title: "Login",
        error: "Mật khẩu sai",
      });
    }

    req.session.user = { ...user.toObject() };
    delete req.session.user.password;

    req.session.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("login", {
      layout: "layouts/auth",
      title: "Login",
      message: "Có sự cố, vui lòng đăng nhập sau",
    });
  }
};

// [GET] => getResetPassword
exports.getResetPassword = async (req, res, next) => {
  res.render("reset-password", { layout: "layouts/auth", title: "Reset" });
};

// [POST] => postNewPassword
exports.postResetNewPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    console.log(req.body.email);

    if (!user) {
      return res.render("reset-password", {
        layout: "layouts/auth",
        title: "Reset",
        error: "Tài khoản không tồn tại",
      });
    }
    user.resetToken = await genarateResetToken();
    user.resetTokenExpiration = Date.now() + 3600000;
    await sendMail(req.body.email, user.resetToken, false);
    await user.save();
    res.render("login", {
      layout: "layouts/auth",
      title: "Login",
      message: "Kiểm tra tài khoản email của bạn để thay đổi mật khẩu",
    });
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
    alert("Thay đổi mật khẩu thành công!");
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
      message: "Xác thực tài khoản thành công!",
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
};
exports.updateProfile = async (req, res) => {
  try {
    let avatarUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        {
          folder: "avatars",
          public_id: `avatar_${Date.now()}`,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
            return res
              .status(500)
              .json({ message: "Lỗi khi tải ảnh lên Cloudinary" });
          }

          avatarUrl = result.secure_url;

          const userId = req.params.id;
          const updatedData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            gender: req.body.gender,
          };

          if (avatarUrl) {
            updatedData.avatar = avatarUrl;
            req.session.user.avatar = avatarUrl;
          }

          User.findByIdAndUpdate(userId, updatedData, { new: true })
            .then((updatedUser) => {
              if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
              }

              return res.render("updateProfile", {
                successMessage: "Cập nhật thông tin cá nhân thành công",
                user: updatedUser,
                userId: userId,
              });
            })
            .catch((error) => {
              console.error("Lỗi khi cập nhật hồ sơ:", error);
              return res
                .status(500)
                .json({ message: "Lỗi khi cập nhật hồ sơ" });
            });
        }
      );

      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      bufferStream.pipe(result);
    } else {
      const userId = req.params.id;
      const updatedData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        gender: req.body.gender,
      };

      User.findByIdAndUpdate(userId, updatedData, { new: true })
        .then((updatedUser) => {
          if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
          }

          return res.render("updateProfile", {
            successMessage: "Cập nhật thông tin cá nhân thành công",
            user: updatedUser,
            userId: userId,
          });
        })
        .catch((error) => {
          console.error("Lỗi khi cập nhật hồ sơ:", error);
          return res.status(500).json({ message: "Lỗi khi cập nhật hồ sơ" });
        });
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật hồ sơ:", error);
    return res.status(500).json({ message: "Lỗi khi cập nhật hồ sơ" });
  }
};
exports.findAll = async (req, res) => {
  try {
    const users = await User.find({});
    res.render("informationUser", { users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    let avatarUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        {
          folder: "avatars",
          public_id: `avatar_${Date.now()}`,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
            return res
              .status(500)
              .json({ message: "Lỗi khi tải ảnh lên Cloudinary" });
          }

          avatarUrl = result.secure_url;

          const userId = req.params.id;
          const updatedData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            gender: req.body.gender,
          };

          if (avatarUrl) {
            updatedData.avatar = avatarUrl;
          }

          User.findByIdAndUpdate(userId, updatedData, { new: true })
            .then((updatedUser) => {
              if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
              }

              return res.render("updateProfile", {
                successMessage: "Cập nhật thông tin cá nhân thành công",
                user: updatedUser,
                userId: userId,
              });
            })
            .catch((error) => {
              console.error("Lỗi khi cập nhật hồ sơ:", error);
              return res
                .status(500)
                .json({ message: "Lỗi khi cập nhật hồ sơ" });
            });
        }
      );

      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      bufferStream.pipe(result);
    } else {
      const userId = req.params.id;
      const updatedData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        gender: req.body.gender,
      };

      User.findByIdAndUpdate(userId, updatedData, { new: true })
        .then((updatedUser) => {
          if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
          }

          return res.render("updateProfile", {
            successMessage: "Cập nhật thông tin cá nhân thành công",
            user: updatedUser,
            userId: userId,
          });
        })
        .catch((error) => {
          console.error("Lỗi khi cập nhật hồ sơ:", error);
          return res.status(500).json({ message: "Lỗi khi cập nhật hồ sơ" });
        });
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật hồ sơ:", error);
    return res.status(500).json({ message: "Lỗi khi cập nhật hồ sơ" });
  }
};

exports.delete = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.render("errorpage");
    }

    res.render("informationUser", { users: user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server");
  }
};

exports.renderChangePasswordPage = (req, res) => {
  const userId = req.params.id;

  if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.render("errorpage");
  }

  res.render("changePassword", { userId });
};

exports.renderUpdateProfilePage = async (req, res) => {
  const userId = req.params.id;

  if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.render("errorpage");
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.render("errorpage");
  }

  res.render("updateProfile", { userId, user });
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.params.id;

    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.render("errorpage");
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.render("changePassword", {
        message: "Người dùng không tồn tại!",
        userId,
      });
    }

    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) {
      return res.render("changePassword", {
        message: "Mật khẩu cũ không đúng!",
        userId,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render("changePassword", {
        message: "Mật khẩu mới không khớp!",
        userId,
      });
    }

    if (newPassword.length < 8) {
      return res.render("changePassword", {
        message: "Mật khẩu mới phải có ít nhất 8 ký tự!",
        userId,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    return res.render("changePassword", {
      successMessage: "Mật khẩu đã được cập nhật thành công!",
      userId,
    });
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    return res.render("changePassword", {
      message: "Lỗi server, vui lòng thử lại!",
      userId,
    });
  }
};
// [POST] => postLogout
exports.postLogout = async (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/login");
  });
};
