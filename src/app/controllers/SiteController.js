class SiteController {
  // [Get] /news
  index(req, res, next) {
    console.log(req.session.isLoggedIn);
    console.log(req.session.user);
    if (req.session.isLoggedIn) {
      return res.redirect("/");
    }
    res.render("login");
  }

  register(req, res, next) {
    if (req.session.isLoggedIn) {
      return res.redirect("/");
    }
    res.render("register");
  }

  // [Get] /search
  search(req, res) {
    res.render("search");
  }
}

module.exports = new SiteController();
