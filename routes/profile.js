const express = require("express");
const router = express.Router();
const slugify = require("slugify");

const verifyAndGetUser = require("../middlewares/verifyAndGetUser");
const checkRegisterForm = require("../middlewares/Validation/checkRegisterForm");
const checkDeleteForm = require("../middlewares/Validation/checkDeleteForm");

const filterSpecialChar = require("../utils/filterSpecialChar");
const deepClone = require("../utils/deepClone");

const User = require("../models/User");

router.get("/", verifyAndGetUser, async (req, res) => {
  const { user } = req;
  const clonedUser = deepClone(user);
  clonedUser.posts = clonedUser.posts.filter(
    (post) => post.anonymous === false
  );
  clonedUser.comments = clonedUser.comments.filter(
    (comment) => comment.anonymous === false
  );

  return res.status(200).json(clonedUser);
});

router.put("/update", verifyAndGetUser, checkRegisterForm, async (req, res) => {
  try {
    const { user } = req;
    const { username, email, password, oldPassword } = req.body;
    if ((await User.exists({ username })) || (await User.exists({ email }))) {
      return res.status(400).json({
        error: "Username or email already exists",
      });
    }

    if (!oldPassword) {
      return res.status(400).json({
        error: "Please enter your old password",
      });
    }

    if (oldPassword !== user.password) {
      return res.status(400).json({
        error: "Old password is incorrect",
      });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.password = password || user.password;
    user.slug =
      slugify(filterSpecialChar(username)) + "-" + Date.now() || user.slug;
    user.updatedAt = Date.now();
    await user.save();

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
});

router.delete(
  "/delete",
  verifyAndGetUser,
  checkDeleteForm,
  async (req, res) => {
    try {
      const { user } = req;
      await user.remove();
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  }
);

module.exports = router;
