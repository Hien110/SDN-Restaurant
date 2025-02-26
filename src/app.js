require('dotenv').config();
const express = require('express');
const db = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;
const router = require('./routes');
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'resources', 'views'));





db.connect();

app.use(
    express.urlencoded({
        extended: true,
    }),
);

app.use(express.json());


app.use(express.static('src/public'));

router(app);

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});