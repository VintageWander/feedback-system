const checkDeleteForm = (req, res, next) => {
  const { user } = req;
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (user.password !== password) {
    return res.status(400).json({ message: "Password is incorrect" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  next();
};

module.exports = checkDeleteForm;
