const isEmail = require("../../utils/isEmail");

const checkLoginForm = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ error: "Email is invalid" });
  }
  next();
};

module.exports = checkLoginForm;
