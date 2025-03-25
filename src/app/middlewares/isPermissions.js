module.exports = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.redirect("/");
  }
  next();
};
