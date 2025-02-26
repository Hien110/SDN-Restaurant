const express = require("express");
const router = express.Router();
const authRouter = require("./authRouter");
const siteRouter = require("./siteRouter");
const restaurantRouter = require("./restaurantsRouter");
const { getFooterData } = require("../app/controllers/RestaurantsController");
const userRoutes = require('./usersRoutes');

function routes(app) {
  // app.use(getFooterData);
  app.use("/restaurantInfor", restaurantRouter);
  app.use("/", getFooterData, siteRouter);
  router.use("/", siteRouter);
  router.use("/", authRouter);
    app.use('/users', userRoutes); 
}

module.exports = routes;