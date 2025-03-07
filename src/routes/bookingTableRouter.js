const express = require('express');
const bookingRouter = express.Router();
const isAuth = require('../app/middlewares/is-auth');
const userController = require("../app/controllers/userController");
const bookingTableController = require("../app/controllers/BookingTableController");

bookingRouter.get('/',isAuth.requireAuth, bookingTableController.index);
bookingRouter.post('/', bookingTableController.createBooking);

module.exports = bookingRouter;