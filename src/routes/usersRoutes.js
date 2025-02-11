const express = require('express');
const userController = require('../app/controllers/UserController');

const userRoutes = express.Router();

userRoutes.use(express.json());
userRoutes.use(express.urlencoded({ extended: true }));

userRoutes.route('/')
.get(userController.findAll)
.post(userController.create)
.put((req, res) => {
    res.status(403).json('PUT operation not supported on /user');
})
.delete(userController.delete);

userRoutes.route('/:id')
.get(userController.findById)
.post((req, res) => {
    res.status(403).json('POST operation not supported on /user/:id' + req.params.id);
})
.put(userController.update)
.delete(userController.delete);

module.exports = userRoutes;

