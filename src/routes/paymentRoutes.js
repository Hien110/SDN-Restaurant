const express = require("express");
const paymentRouter = express.Router();
const isAuth = require("../app/middlewares/is-auth");
const userController = require("../app/controllers/userController");
const bookingTableController = require("../app/controllers/BookingTableController");
const paymentController = require("../app/controllers/PaymentController");
paymentRouter.get("/", paymentController.checkPaid);

module.exports = paymentRouter;
