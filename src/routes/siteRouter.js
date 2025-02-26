const express = require("express");
const router = express.Router();
const isAuth = require("../app/middlewares/is-auth");
const siteController = require("../app/controllers/SiteController");
const authController = require("../app/controllers/userController");
router.get("/login", siteController.index);
router.get("/register", siteController.register);
router.get("/reset-password", authController.getReset);
router.get("/", (req, res) => {
  res.render("home");
});
router.get("/new-password/:resetToken", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
