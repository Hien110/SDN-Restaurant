module.exports = routes;

const express = require("express");
const router = express.Router();
const authRouter = require("./authRouter");
const siteRouter = require("./siteRouter");
const bookingRouter = require("./bookingTableRouter");
const restaurantRouter = require("./restaurantsRouter");
const { getFooterData } = require("../app/controllers/RestaurantsController");
const userRoutes = require("./usersRoutes");
const paymentRoutes = require("./paymentRoutes");

function routes(app) {
  app.use("/restaurantInfor", restaurantRouter);
  app.use("/", getFooterData, siteRouter);
  app.use("/", authRouter);
  app.use("/users", userRoutes);
  app.use("/bookingTable", bookingRouter);
  app.use("/payments", paymentRoutes);
}

module.exports = routes;
