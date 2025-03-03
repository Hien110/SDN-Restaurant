const express = require('express');
const staffRouter = express.Router();
const staffController = require('../app/controllers/staffController');
const isAuth = require('../app/middlewares/is-auth');

staffRouter.get("/", isAuth, staffController.getStaffs);

staffRouter.get("/create", staffController.create);

staffRouter.get("/detail/:userId", isAuth, staffController.getStaffDetail);

staffRouter.get("/update/:userId", isAuth, staffController.update);

staffRouter.post("/update/:userId", staffController.updateStaff);

staffRouter.post("/create", isAuth, staffController.createStaff);

staffRouter.post("/lock/:id", isAuth, staffController.lockStaff);

module.exports = staffRouter;