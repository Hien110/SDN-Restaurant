module.exports = (roles) => (req, res, next) => {
  console.log("roles", roles);
  console.log("req.user.role", req.user.role);
  console.log(!roles.includes(req.user.role));

  if (!roles.includes(req.user.role)) {
    res.redirect("/");
  }
  next();
};
