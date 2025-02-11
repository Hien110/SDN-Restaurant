const express = require('express');
const db = require('./config/db');
const app = express();
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

app.use(express.static('src/public'));

app.use(router);


app.listen(3000);