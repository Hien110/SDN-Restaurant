const express = require("express");
const router = express.Router();
const authController = require("../app/controllers/userController");

//BE
router.post("/sign-up", authController.postSignUp);
router.post("/sign-in", authController.postSignIn);
router.post("/reset-password", authController.postNewPassword);
router.get("/verify/:resetToken", authController.getVerify);
router.post("/logout", authController.postLogout);
router.post("/new-password", authController.postNewPassword);
router.get("/new-password/:resetToken", authController.getNewPassword);

//FE
// router.get("/sign-up", authController.getSignUp);
// router.get("/sign-in", authController.getSignIn);
// router.get("/reset", authController.getReset);

module.exports = router;
