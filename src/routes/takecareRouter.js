const express = require("express");
const takeCareRouter = express.Router();
const takeCareController = require("../app/controllers/TakeCareController");
const isAuth = require("../app/middlewares/is-auth");

takeCareRouter.get("/", isAuth.requireAuth, takeCareController.getTakeCares);

takeCareRouter.get("/create", takeCareController.renderCreateTakeCare);

takeCareRouter.post("/create", isAuth.requireAuth, takeCareController.createTakeCare);

takeCareRouter.get("/update/:id", isAuth.requireAuth, takeCareController.renderUpdateTakeCare);

takeCareRouter.post("/update/:id", takeCareController.updateTakeCare);

takeCareRouter.post("/delete/:id", isAuth.requireAuth, takeCareController.deleteTakeCare);

module.exports = takeCareRouter;