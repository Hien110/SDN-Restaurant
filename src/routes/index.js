const express = require("express");
const router = express.Router();
const authRouter = require("./authRouter");
const siteRouter = require("./siteRouter");
const restaurantRouter = require("./restaurantsRouter");
const { getFooterData } = require("../app/controllers/RestaurantsController");

function routes(app) {
  // app.use(getFooterData);
  app.use("/restaurantInfor", restaurantRouter);
  app.use("/", getFooterData, siteRouter);
  app.use("/", siteRouter);
  app.use("/", authRouter);
}

module.exports = routes;
