const express = require("express");
const takeCareRouter = express.Router();
const takeCareController = require("../app/controllers/TakeCareController");
const isAuth = require("../app/middlewares/is-auth");

takeCareRouter.get("/", isAuth.requireAuth, takeCareController.getTakeCares);

takeCareRouter.get("/create", takeCareController.renderCreateTakeCare);

takeCareRouter.get('/detail/:id', takeCareController.renderDetailTakeCare);

takeCareRouter.post("/create", isAuth.requireAuth, takeCareController.createTakeCare);

takeCareRouter.get("/update/:id", isAuth.requireAuth, takeCareController.renderUpdateTakeCare);

takeCareRouter.post("/update/:id", takeCareController.updateTakeCare);

takeCareRouter.post("/delete/:id", isAuth.requireAuth, takeCareController.deleteTakeCare);

takeCareRouter.get("/staff/:userId", isAuth.requireAuth, takeCareController.getStaffSchedule);

module.exports = takeCareRouter;