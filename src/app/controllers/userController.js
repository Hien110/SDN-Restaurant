
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
    req.session.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
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

const cloudinary = require('../../config/cloudinary/index.js');
// const User = require('../models/User');
const multer = require('multer');
const fs = require('fs');
const stream = require('stream');


const storage = multer.memoryStorage();


const upload = multer({ storage: storage });

class UserController {
    constructor() {
        
        this.upload = upload;
    }

    findAll = async (req, res) => {
        try {
            const users = await User.find({});
            res.render("informationUser", { users });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    create = async (req, res) => {
        try {
            const user = new User(req.body);
            await user.save();
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };

    updateProfile = async (req, res) => {
        try {
            let avatarUrl = null;
            
            if (req.file) {
                const result = await cloudinary.uploader.upload_stream(
                    { 
                        folder: 'avatars',
                        public_id: `avatar_${Date.now()}`,
                        overwrite: true,
                    },
                    (error, result) => {
                        if (error) {
                            console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
                            return res.status(500).json({ message: 'Lỗi khi tải ảnh lên Cloudinary' });
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
                                    return res.status(404).json({ message: 'User not found' });
                                }
    
                                return res.render("updateProfile", {
                                    successMessage: "Cập nhật thông tin cá nhân thành công",
                                    user: updatedUser,
                                    userId: userId
                                });
                            })
                            .catch((error) => {
                                console.error("Lỗi khi cập nhật hồ sơ:", error);
                                return res.status(500).json({ message: 'Lỗi khi cập nhật hồ sơ' });
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
                            return res.status(404).json({ message: 'User not found' });
                        }
    
                        return res.render("updateProfile", {
                            successMessage: "Cập nhật thông tin cá nhân thành công",
                            user: updatedUser,
                            userId: userId
                        });
                    })
                    .catch((error) => {
                        console.error("Lỗi khi cập nhật hồ sơ:", error);
                        return res.status(500).json({ message: 'Lỗi khi cập nhật hồ sơ' });
                    });
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật hồ sơ:", error);
            return res.status(500).json({ message: 'Lỗi khi cập nhật hồ sơ' });
        }
    };
    

    delete = async (req, res) => {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);
            if (!deletedUser) return res.status(404).json({ message: 'User not found' });
            res.status(200).json(deletedUser);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    findById = async (req, res) => {
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

    renderChangePasswordPage = (req, res) => {
        const userId = req.params.id;

        if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.render("errorpage");
        }

        res.render("changePassword", { userId });
    };

    renderUpdateProfilePage = async (req, res) => {
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

    changePassword = async (req, res) => {
        try {
            const { oldPassword, newPassword, confirmPassword } = req.body;
            const userId = req.params.id;

            if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
                return res.render("errorpage");
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.render("changePassword", { message: "Người dùng không tồn tại!", userId });
            }

            if (oldPassword !== user.password) {
                return res.render("changePassword", { message: "Mật khẩu cũ không đúng!", userId });
            }

            if (newPassword !== confirmPassword) {
                return res.render("changePassword", { message: "Mật khẩu mới không khớp!", userId });
            }

            if (newPassword.length < 8) {
                return res.render("changePassword", { message: "Mật khẩu mới phải có ít nhất 8 ký tự!", userId });
            }

            user.password = newPassword;
            await user.save();

            return res.render("changePassword", { successMessage: "Mật khẩu đã được cập nhật thành công!", userId });
        } catch (error) {
            console.error("Lỗi khi đổi mật khẩu:", error);
            return res.render("changePassword", { message: "Lỗi server, vui lòng thử lại!", userId });
        }
    };
}

module.exports = new UserController();