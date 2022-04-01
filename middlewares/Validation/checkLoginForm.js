const isEmail = require("../../utils/isEmail");

const checkLoginForm = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ message: "Email is invalid" });
  }
  next();
};

module.exports = checkLoginForm;
