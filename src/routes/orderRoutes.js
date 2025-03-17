const express = require("express");
const router = express.Router();
const orderController = require("../app/controllers/OrderController");

router.get("/", orderController.getOrder);
router.get("/orderDishOnline", orderController.orderDishOnline);

module.exports = router;
