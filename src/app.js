require("dotenv").config();
const express = require("express");
const db = require("./config/db");
const router = require("./routes");
const path = require("path");
const passport = require("./config/oauth20");
const sessionMiddleware = require("./config/session");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require('method-override');

const app = express();
const port = process.env.PORT || 3000;

app.use(methodOverride('_method'));
app.use("/image", express.static(path.join(__dirname, "public", "image"), { maxAge: "1y" }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "resources", "views"));

app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use(expressLayouts);
app.set("layout", "layouts/main");
db.connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(express.static(path.join(__dirname, "public")));

router(app);

app.listen(port, () => {
  console.log(`Server đang chạy`);
});
