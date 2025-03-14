const express = require('express');
const bookingRouter = express.Router();
const isAuth = require('../app/middlewares/is-auth');
const userController = require("../app/controllers/userController");
const bookingTableController = require("../app/controllers/BookingTableController");

bookingRouter.get('/',isAuth.requireAuth, bookingTableController.index);
bookingRouter.get('/management', bookingTableController.listBookingManagement);
bookingRouter.get('/bookingHistory/:id', bookingTableController.bookingHistory);
bookingRouter.get('/bookingDetail/:id', bookingTableController.historyDetail);
bookingRouter.get('/bookingDetail/:id/edit', bookingTableController.updateForm);
bookingRouter.put('/bookingUpdate/:id', bookingTableController.updateBookingTable);
bookingRouter.delete('/bookingDetail/:id', bookingTableController.deleteBooking);
bookingRouter.post('/', bookingTableController.createBooking);

module.exports = bookingRouter;