const User = require("../../models/User");

const userExists = (req, res, next) => {
  const userID = req.userID;
  User.findById(userID)
    .then((user) => {
      if (!user) return res.status(404).json({ error: "User not found" });
      req.user = user;
      next();
    })
    .catch((error) => res.status(500).json({ err: error }));
};

module.exports = userExists;
