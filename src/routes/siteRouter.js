const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');

router.get('/login', siteController.index);
router.get('/register', siteController.register);


module.exports = router;
