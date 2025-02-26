const cloudinary = require('../../config/cloudinary/index.js');
const User = require('../models/User');
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
