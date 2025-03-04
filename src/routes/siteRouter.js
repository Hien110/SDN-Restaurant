const express = require("express");
const router = express.Router();
const siteController = require("../app/controllers/SiteController");

router.get("/", siteController.home);
router.get("/home", siteController.home);
router.get("/admin", siteController.homeAdmin);
router.get("/aboutUs", siteController.aboutUs);

module.exports = router;
