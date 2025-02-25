const express = require("express");
const router = express.Router();
const authController = require("../app/controllers/userController");

//BE
router.post("/sign-up", authController.postSignUp);
router.post("/sign-in", authController.postSignIn);

//FE
// router.get("/sign-up", authController.getSignUp);
// router.get("/sign-in", authController.getSignIn);

module.exports = router;
