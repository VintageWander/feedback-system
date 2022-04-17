const checkDeleteForm = (req, res, next) => {
  // get the user from the request
  const { user } = req;
  // get password and confirm password from the delete form
  const { password, confirmPassword } = req.body;
  // check one of the fields are empty
  if (!password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }
  // check if the user's password matches the password from the delete form
  if (user.password !== password) {
    return res.status(400).json({ error: "Password is incorrect" });
  }
  // check if the password and confirm password are the same
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  // proceed if all are correct
  next();
};

module.exports = checkDeleteForm;
