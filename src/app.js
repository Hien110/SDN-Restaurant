require("dotenv").config();
const express = require("express");
const db = require("./config/db");
const app = express();
const router = require("./routes");
const MongoStore = require("connect-mongo");
const path = require("path");
const session = require("express-session");
// const csurf = require("csurf");
const port = process.env.PORT || 3000;
const dbUri = process.env.DB_URI;
const sessionSecret = process.env.SESSION_SECRET;
const ageSession = Number(process.env.AGE_SESSION);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "resources", "views"));

db.connect();

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: dbUri,
    }),
    cookie: {
      maxAge: ageSession,
    },
  })
);

app.use(express.static(path.join(__dirname, "public")));

// app.use(csurfProtection);

app.use(router);

app.listen(port);
