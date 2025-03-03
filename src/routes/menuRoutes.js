const express = require("express");
const router = express.Router();
const menuController = require("../app/controllers/MenuController");

router.get("/", menuController.getList);
router.get('/detail/:id', menuController.renderDetailDish);
router.delete('/:id', menuController.deleteDish);
router.get('/add', menuController.renderCreateForm);
router.get('/edit/:id', menuController.renderEditForm);
router.put('/:id', menuController.updateDish);
router.post("/", menuController.createDish);
router.delete("/", menuController.deleteDish);
router.put("/", menuController.updateDish);
router.get("/search", menuController.searchDish);

module.exports = router;
