const express = require("express");
const router = express.Router();
const isAuth = require("../app/middlewares/is-auth");
const siteController = require("../app/controllers/SiteController");
// const authController = require("../app/controllers/UserController");

router.get("/", siteController.home);
router.get("/login", siteController.index);
router.get("/register", siteController.register);
// router.get("/reset-password", authController.getReset);
router.get("/home", siteController.home);
router.get("/admin", siteController.homeAdmin);
// router.get("/new-password/:resetToken", authController.getNewPassword);
// router.post("/new-password", authController.postNewPassword);

module.exports = router;
