const express = require('express');
const router = express.Router();
const tablesController = require('../app/controllers/TablesController');

// GET: List all tables
router.get('/', tablesController.getTables);

// GET: Show form to add a new table
router.get('/add', tablesController.addTables);

// POST: Create a new table
router.post('/create', tablesController.upload.single('image'), tablesController.createTables);

// GET: Show form to edit a table
router.get('/edit/:tableId', tablesController.getEditTableForm);


router.post('/edit/:tableId', tablesController.upload.single('image'), tablesController.updateTable);

// GET: Delete a table
router.get('/delete/:tableId', tablesController.deleteTable);

module.exports = router;