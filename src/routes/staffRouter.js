const express = require('express');
const staffRouter = express.Router();
const staffController = require('../app/controllers/staffController');
const isAuth = require('../app/middlewares/is-auth');

staffRouter.get("/", isAuth.requireAuth, staffController.getStaffs);

staffRouter.get("/create", staffController.create);

staffRouter.get("/detail/:userId", isAuth.requireAuth, staffController.getStaffDetail);

staffRouter.get("/update/:userId", isAuth.requireAuth, staffController.update);

staffRouter.post("/update/:userId", staffController.updateStaff);

staffRouter.post("/create", isAuth.requireAuth, staffController.createStaff);

staffRouter.post("/lock/:id", isAuth.requireAuth, staffController.lockStaff);

module.exports = staffRouter;