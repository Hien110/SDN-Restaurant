const express = require('express')
const restaurantRoute = express.Router();

const restaurantsControllers = require('../app/controllers/RestaurantsController')

restaurantRoute.post('/', restaurantsControllers.create)
restaurantRoute.get('/', restaurantsControllers.getAll)
restaurantRoute.get('/managers', restaurantsControllers.getInformationRes)
restaurantRoute.put('/updateInforRes', restaurantsControllers.updateRestaurant)
module.exports = restaurantRoute;
