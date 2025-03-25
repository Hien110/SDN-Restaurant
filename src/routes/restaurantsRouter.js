const express = require("express");
const restaurantRoute = express.Router();

const restaurantsControllers = require("../app/controllers/RestaurantsController");
const isAuth = require("../app/middlewares/is-auth");
const isPermissions = require("../app/middlewares/isPermissions");

restaurantRoute.post(
  "/",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  restaurantsControllers.create
);
restaurantRoute.get(
  "/",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  restaurantsControllers.getAll
);

module.exports = restaurantRoute;
