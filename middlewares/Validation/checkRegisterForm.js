const isEmail = require("../../utils/isEmail");
const keepOneSpace = require("../../utils/keepOneSpace");
const isInvalidCharacter = require("../../utils/isInvalidCharacter");

const checkRegisterForm = (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ message: "Email is invalid" });
  }
  req.body.username = keepOneSpace(username);
  if (req.body.username.length < 2) {
    return res.status(400).json({ message: "Username is too short" });
  }
  if (isInvalidCharacter(req.body.username)) {
    return res.status(400).json({ message: "Invalid username" });
  }
  next();
};

module.exports = checkRegisterForm;
