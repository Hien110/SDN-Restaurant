const express = require('express');
const router = express.Router();
const menuController = require('../app/controllers/MenuController');

router.get('/', menuController.getList);
router.post('/', menuController.createDish);
router.delete('/', menuController.deleteDish);
router.put('/', menuController.updateDish);
router.get('/search', menuController.searchDish);

module.exports = router;        