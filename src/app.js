const express = require('express');
const db = require('./config/db');
const app = express();
const router = require('./routes');
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'resources','views'));


db.connect();

app.use(
    express.urlencoded({
        extended: true,
    }),
);

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

router(app);

app.listen(3000);