const isEmail = require("../../utils/isEmail");
const keepOneSpace = require("../../utils/keepOneSpace");
const isInvalidCharacter = require("../../utils/isInvalidCharacter");

const checkRegisterForm = (req, res, next) => {
  // take 4 fields from the register form
  const { username, email, password, confirmPassword } = req.body;
  // check if any of the fields are missing
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }
  // check if the password and confirm password are the same
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  // check if the email is valid
  if (!isEmail(email)) {
    return res.status(400).json({ error: "Email is invalid" });
  }
  // sanitize the username to keep one space between each words
  req.body.username = keepOneSpace(username);
  // check if after the sanitization the username length is greater than 2
  if (req.body.username.length < 2) {
    return res.status(400).json({ error: "Username is too short" });
  }
  // check if the username after sanitization contains any invalid character
  if (isInvalidCharacter(req.body.username)) {
    return res.status(400).json({ error: "Invalid username" });
  }
  next();
};

module.exports = checkRegisterForm;
