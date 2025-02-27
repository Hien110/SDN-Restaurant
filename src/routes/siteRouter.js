const express = require("express");
const router = express.Router();
const isAuth = require("../app/middlewares/is-auth");
const siteController = require("../app/controllers/SiteController");
const authController = require("../app/controllers/userController");

router.get("/", siteController.home);
router.get("/login", siteController.index);
router.get("/register", siteController.register);
router.get("/reset-password", authController.getResetPassword);
router.get("/home", siteController.home);
router.get("/admin", siteController.homeAdmin);

module.exports = router;
