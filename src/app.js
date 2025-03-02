require("dotenv").config();
const express = require("express");
const db = require("./config/db");
<<<<<<< HEAD
const router = require("./routes");
const path = require("path");
const passport = require("./config/oauth20");
const sessionMiddleware = require("./config/session");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const port = process.env.PORT || 3000;
=======
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
>>>>>>> 2cefcc466b7582122a2334ee7c6a93a3b7c6b1b2

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "resources", "views"));

app.use(expressLayouts);
app.set("layout", "layouts/main");
<<<<<<< HEAD

db.connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());
=======
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
>>>>>>> 2cefcc466b7582122a2334ee7c6a93a3b7c6b1b2

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(express.static(path.join(__dirname, "public")));

<<<<<<< HEAD
router(app);

app.listen(port, () => {
  console.log(`Server đang chạy`);
});
=======
// app.use(csurfProtection);

router(app);

app.listen(port);
>>>>>>> 2cefcc466b7582122a2334ee7c6a93a3b7c6b1b2
