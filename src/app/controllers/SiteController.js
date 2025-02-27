class SiteController {
  // [Get] /news
  index(req, res, next) {
    console.log(req.session.isLoggedIn);
    console.log(req.session.user);
    if (req.session.isLoggedIn) {
      return res.redirect("/");
    }
    res.render("login", { layout: "layouts/auth", title: "Login" });
  }

  register(req, res, next) {
    if (req.session.isLoggedIn) {
      return res.redirect("/");
    }
    res.render("register", { layout: "layouts/auth", title: "Register" });
  }

  home(req, res) {
    res.render("home");
  }

  homeAdmin(req, res, next) {
    res.render('admin', { layout: 'layouts/mainAdmin', title: 'admin' });
  }

module.exports = new SiteController();
