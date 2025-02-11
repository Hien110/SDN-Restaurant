
class SiteController {
  // [Get] /news
  index(req, res, next) {
      res.render('login');
  }

  // [Get] /search
  search(req, res) {
    res.render("search");
  }
}

module.exports = new SiteController();
