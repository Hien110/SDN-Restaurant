const express = require('express');
const mongoose = require('mongoose');
const userController = require('../app/controllers/UserController');

const userRoutes = express.Router();

userRoutes.use(express.json());
userRoutes.use(express.urlencoded({ extended: true }));

userRoutes.post('/', userController.create);
userRoutes.post("/update-profile/:id", userController.upload.single('avatar'), userController.updateProfile);

userRoutes.get("/update-profile/:id", userController.renderUpdateProfilePage);
userRoutes.get("/change-password/:id", userController.renderChangePasswordPage);
userRoutes.post("/change-password/:id", userController.changePassword);
userRoutes.put("/change-password/:id", userController.changePassword);

userRoutes.use("/:id", (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.render("errorpage");
    }
    next();
});

userRoutes.get("/:id", userController.findById);

userRoutes.route('/:id')
    .delete(userController.delete);

module.exports = userRoutes;
