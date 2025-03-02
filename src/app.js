require("dotenv").config();
const express = require("express");
const db = require("./config/db");
const app = express();
const router = require("./routes");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const MongoStore = require("connect-mongo");
const session = require("express-session");
// const csurf = require("csurf");
const port = process.env.PORT || 3000;
const dbUri = process.env.DB_URI;
const sessionSecret = process.env.SESSION_SECRET;
const ageSession = Number(process.env.AGE_SESSION);

app.use(express.static(path.join(__dirname, "public"), { maxAge: "1y" }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "resources", "views"));

app.use(expressLayouts);
app.set("layout", "layouts/main");
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

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(express.static(path.join(__dirname, "public")));
// app.use(csurfProtection);

router(app);

app.listen(port);
