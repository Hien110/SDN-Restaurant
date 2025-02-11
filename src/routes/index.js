const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Trang chủ');
});

module.exports = router; // ✅ Export đúng cách
