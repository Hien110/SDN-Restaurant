
class SiteController {
  // [Get] /news
  index(req, res, next) {
      res.render('login');
  }

  register(req, res, next) {
      res.render('register');
  }

  // [Get] /search
  search(req, res) {
    res.render("search");
  }
}


module.exports = new SiteController();
