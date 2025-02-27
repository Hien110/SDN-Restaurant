const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');

router.get('/', siteController.home)
router.get('/login', siteController.index);
router.get('/register', siteController.register);
router.get('/home', siteController.home)
router.get('/admin', siteController.homeAdmin)
  

module.exports = router;
