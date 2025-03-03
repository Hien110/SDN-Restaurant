const express = require('express');
const router = express.Router();
const tableController = require('../app/controllers/TablesController');

router.post("/", tableController.create);
router.get("/", tableController.getAll); 
router.get("/:id", tableController.getById);
router.put("/:id", tableController.update);
router.delete("/:id", tableController.delete); 

module.exports = router;
