const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const slugify = require("slugify");

require("dotenv").config();

const User = require("../models/User");

const checkRegisterForm = require("../middlewares/Validation/checkRegisterForm");
const checkLoginForm = require("../middlewares/Validation/checkLoginForm");
const verifyAndGetUser = require("../middlewares/verifyAndGetUser");

router.post("/register", checkRegisterForm, async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if ((await User.exists({ email })) || (await User.exists({ username }))) {
      return res.status(400).json({ error: "User already exists" });
    }
    const user = await User.create({
      email,
      username,
      password,
      slug: slugify(username) + "-" + Date.now(),
      createdAt: Date.now(),
    });
    if (!user) {
      return res.status(500).json({ error: "User could not be created" });
    }
    return res.status(200).json({ message: "Successfully registered" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.post("/login", checkLoginForm, async (req, res) => {
  try {
    // get the email and the password from the login form
    const { email, password } = req.body;
    // check if the user exists
    const user = await User.findOne({ email, password }).select({
      username: 1,
      email: 1,
      slug: 1,
      role: 1,
    });
    // if the user does not exist
    if (!user) {
      // return an error
      return res.status(403).json({ error: "Invalid credentials" });
    }
    // if the user exists
    // create an access token
    const accessToken = jwt.sign(
      { userID: user._id, email: user.email, username: user.username },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    // create a refresh token
    const refreshToken = jwt.sign(
      { userID: user._id, email: user.email, username: user.username },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1h" }
    );
    // assign the refresh token to the user
    user.refreshToken = refreshToken;
    await user.save();
    // filter the output object
    const filteredUser = {
      username: user.username,
      email: user.email,
      role: user.role,
      slug: user.slug,
    };
    // return both the access, refresh tokens, and the user data
    return res.status(200).json({
      accessToken,
      refreshToken,
      user: filteredUser,
    });
  } catch (error) {
    // if there's an error, log the error
    console.log(error);
    // and return an error
    return res.status(500).json({ error });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: "Invalid refresh token" });
        }
        const user = await User.findById(decoded.userID);
        if (!user) {
          return res
            .status(401)
            .json({ error: "No user with this refresh token" });
        }
        if (user.refreshToken !== refreshToken) {
          return res.status(401).json({ error: "Invalid refresh token" });
        }
        const accessToken = jwt.sign(
          { userID: user._id, email: user.email, username: user.username },
          process.env.JWT_ACCESS_SECRET,
          { expiresIn: "15m" }
        );
        return res.status(200).json({ accessToken });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.delete("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: "Invalid refresh token" });
        }
        const user = await User.findById(decoded.userID);
        if (!user) {
          return res
            .status(401)
            .json({ error: "No user with this refresh token" });
        }
        if (user.refreshToken !== refreshToken) {
          return res.status(401).json({ error: "Invalid refresh token" });
        }
        user.refreshToken = null;
        await user.save();
        return res.status(200).json({ message: "Successfully logged out" });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.post("/check", verifyAndGetUser, (req, res) => {
  return res.status(200).json({ user: req.user });
});

module.exports = router;
