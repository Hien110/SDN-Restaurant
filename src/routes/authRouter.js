const express = require("express");
const router = express.Router();
const userController = require("../app/controllers/userController");

//BE
router.post("/sign-up", userController.postSignUp);
router.post("/sign-in", userController.postSignIn);
router.post("/reset-password", userController.postReset);
// router.post("/logout", UserController.postLogout);

module.exports = router;
