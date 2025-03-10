const express = require("express");
const router = express.Router();
const upload = require("../config/multer/index");
const menuController = require("../app/controllers/EditMenuController");

router.get("/", menuController.getList);
router.get('/detail/:id', menuController.renderDetailDish);
router.delete('/:id', menuController.deleteDish);
router.get('/add', menuController.renderCreateForm);
router.get('/edit/:id', menuController.renderEditForm);
router.put('/:id', upload.single("image"), menuController.updateDish);
router.post("/", upload.single("image"), menuController.createDish);
router.delete("/", menuController.deleteDish);
router.put("/", menuController.updateDish);
router.get("/search", menuController.searchDish);

module.exports = router;
