const express = require("express");
const router = express.Router();
const upload = require("../config/multer/index");
const newsController = require("../app/controllers/EditNewsController");

router.get("/", newsController.getList);
router.get('/detail/:id', newsController.renderDetailNews);
router.delete('/:id', newsController.deleteNews);
router.get('/add', newsController.renderCreateForm);
router.get('/edit/:id', newsController.renderEditForm);
router.put('/:id', upload.single("image"), newsController.updateNews);
router.post("/", upload.single("image"), newsController.createNews);
router.delete("/", newsController.deleteNews);
router.put("/", newsController.updateNews);
router.get("/search", newsController.searchNews);

module.exports = router;
