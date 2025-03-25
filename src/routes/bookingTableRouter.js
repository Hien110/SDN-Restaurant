const express = require("express");
const bookingRouter = express.Router();
const isAuth = require("../app/middlewares/is-auth");
const userController = require("../app/controllers/userController");
const bookingTableController = require("../app/controllers/BookingTableController");
const isPermission = require("../app/middlewares/isPermissions");

bookingRouter.get("/", isAuth.requireAuth, bookingTableController.index);
bookingRouter.get(
  "/management",
  isPermission(["ADMIN"]),
  bookingTableController.listBookingManagement
);
bookingRouter.get(
  "/bookingHistory/:id",
  isAuth.requireAuth,
  bookingTableController.bookingHistory
);
bookingRouter.get(
  "/bookingDetail/:id",
  isAuth.requireAuth,
  bookingTableController.historyDetail
);
bookingRouter.get(
  "/bookingDetail/:id/edit",
  isAuth.requireAuth,
  bookingTableController.updateForm
);
bookingRouter.put(
  "/bookingUpdate/:id",
  isAuth.requireAuth,
  bookingTableController.updateBookingTable
);
bookingRouter.delete(
  "/bookingDetail/:id",
  isAuth.requireAuth,
  bookingTableController.deleteBooking
);
bookingRouter.post(
  "/",
  isAuth.requireAuth,
  bookingTableController.createBooking
);

module.exports = bookingRouter;
