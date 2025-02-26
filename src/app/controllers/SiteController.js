
class SiteController {
  // [Get] /news
  index(req, res, next) {
      res.render('login', { layout: 'layouts/auth', title: 'Login' });
  }

  register(req, res, next) {
      res.render('register', { layout: 'layouts/auth', title: 'Register' });
  }

  home(req, res) {
    res.render('home')
  }
}


module.exports = new SiteController();
