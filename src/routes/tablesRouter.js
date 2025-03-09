const express = require('express');
const router = express.Router();
const tablesController = require('../app/controllers/TablesController');

router.get("/", tablesController.getTables);
router.get("/add", tablesController.addTables);
router.post("/create", tablesController.createTables);
router.get("/edit/:tableId", tablesController.getEditTableForm);
router.post("/edit/:tableId", tablesController.updateTable);
router.get("/delete/:tableId", tablesController.deleteTable);

 

module.exports = router;
