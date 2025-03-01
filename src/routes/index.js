module.exports = routes;

const express = require("express");
const router = express.Router();
const authRouter = require("./authRouter");
const siteRouter = require("./siteRouter");
const bookingRouter = require("./bookingTableRouter");
const restaurantRouter = require("./restaurantsRouter");
const { getFooterData } = require("../app/controllers/RestaurantsController");
const userRoutes = require("./usersRoutes");
const isAuth = require("../app/middlewares/is-auth");

function routes(app) {
  app.use("/restaurantInfor", restaurantRouter);
  app.use("/",isAuth.setUser, getFooterData, siteRouter);
  app.use("/", authRouter);
  app.use('/users', userRoutes); 
  app.use('/bookingTable', bookingRouter); 
}

module.exports = routes;
