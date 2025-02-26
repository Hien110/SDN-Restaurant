const express = require("express");
const router = express.Router();
const authController = require("../app/controllers/userController");

//BE
router.post("/sign-up", authController.postSignUp);
router.post("/sign-in", authController.postSignIn);
router.post("/reset-password", authController.postReset);
router.post("/logout", authController.postLogout);

//FE
// router.get("/sign-up", authController.getSignUp);
// router.get("/sign-in", authController.getSignIn);
// router.get("/reset", authController.getReset);

module.exports = router;
