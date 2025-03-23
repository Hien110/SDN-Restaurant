const express = require("express");
const paymentRouter = express.Router();
const isAuth = require("../app/middlewares/is-auth");
const paymentController = require("../app/controllers/PaymentController");

paymentRouter.get("/:description/checkPaid", paymentController.checkPaid);
paymentRouter.get("/:bookingId", paymentController.reOpenPayment);

module.exports = paymentRouter;
