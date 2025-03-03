const express = require('express')
const restaurantRoute = express.Router();

const restaurantsControllers = require('../app/controllers/RestaurantsController')

restaurantRoute.post('/', restaurantsControllers.create)
restaurantRoute.get('/', restaurantsControllers.getAll)

module.exports = restaurantRoute;
