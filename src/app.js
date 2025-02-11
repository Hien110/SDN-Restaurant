require('dotenv').config();
const express = require('express');
const db = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;

const user = require('../src/app/models/User');
const usersRoutes = require('../src/routes/usersRoutes'); 
const router = require('./routes');
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

db.connect();

app.use(
    express.urlencoded({
        extended: true,
    }),
);

app.use(express.json());

app.use('/users', usersRoutes);

app.use(express.static('src/public'));

app.use(router);


app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});