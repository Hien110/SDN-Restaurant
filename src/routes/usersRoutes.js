const express = require('express');
const usersController = require('../controllers/usersController');

const usersRoutes = express.Router();

usersRoutes.use(express.json());
usersRoutes.use(express.urlencoded({ extended: true }));

usersRoutes.route('/')
.get(usersController.findAll)
.post(usersController.create)
.put((req, res) => {
    res.status(403).json('PUT operation not supported on /users');
})
.delete(usersController.delete);
usersRoutes.route('/:id')
.get(usersController.findById)
.post((req, res) => {
    res.status(403).json('POST operation not supported on /users/:id');
})
.put(usersController.update)
.delete(usersController.delete);

module.exports = usersRoutes;