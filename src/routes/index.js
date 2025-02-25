const express = require("express");
const router = express.Router();
const authRouter = require("./authRouter");
const siteRouter = require("./siteRouter");

router.use("/", siteRouter);
router.use("/", authRouter);

module.exports = router;
