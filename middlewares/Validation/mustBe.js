const mustBe = (arrayOfRoles) => {
  return (req, res, next) => {
    if (arrayOfRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: "You do not have permission" });
  };
};

module.exports = mustBe;
