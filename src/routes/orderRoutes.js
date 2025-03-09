const express = require("express");
const router = express.Router();
const orderController = require('../app/controllers/OrderController')
router.get("/", orderController.viewAllTables)
router.get('/chef', orderController.chefViewDishes)
router.get("/:tableId", orderController.viewATable)
router.post('/', orderController.addDishes2Table)
router.get('/order-of-table/:tableId', orderController.getOrderOfTableID)
module.exports = router;