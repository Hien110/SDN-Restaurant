const express = require("express");
const router = express.Router();
const isAuth = require("../app/middlewares/is-auth");
const siteController = require("../app/controllers/SiteController");

router.get("/login", siteController.index);
router.get("/register", siteController.register);
router.get("/", isAuth, (req, res) => {
  res.render("home");
});

module.exports = router;
