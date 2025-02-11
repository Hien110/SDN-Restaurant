const router = require('../routes/usersRoutes');


router.get('/', (req, res) => {
    res.send('Trang chủ');
});

module.exports = router; 
