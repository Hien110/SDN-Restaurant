const express = require("express");
const router = express.Router();
const siteController = require("../app/controllers/siteController");

router.get("/", siteController.home);
router.get("/home", siteController.home);
router.get("/admin", siteController.homeAdmin);

module.exports = router;
