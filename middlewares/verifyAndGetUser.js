const jwt = require("jsonwebtoken");

const Post = require("../models/Post");
const Thread = require("../models/Thread");
const User = require("../models/User");
const Comment = require("../models/Comment");

const threadPopulate = require("../populate/thread");
const postPopulate = require("../populate/post");

const verifyAndGetUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ error: "Access token missing" });
    }
    jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await User.findById(decoded.userID)
          .select(["-__v", "-refreshToken"])
          .populate({
            path: "threads",
            select: ["topic", "slug", "approved", "createdAt", "updatedAt"],
          })
          .populate({
            path: "posts",
            select: ["title", "slug", "createdAt", "updatedAt", "anonymous"],
          })
          .populate({
            path: "comments",
            select: [
              "title",
              "content",
              "slug",
              "anonymous",
              "createdAt",
              "updatedAt",
            ],
          })
          .populate({
            path: "upvotedPosts",
            select: ["title", "slug", "anonymous", "createdAt", "updatedAt"],
          })
          .populate({
            path: "downvotedPosts",
            select: ["title", "slug", "anonymous", "createdAt", "updatedAt"],
          })
          .populate({
            path: "upvotedComments",
            select: ["title", "slug", "anonymous", "createdAt", "updatedAt"],
          })
          .populate({
            path: "downvotedComments",
            select: ["title", "slug", "anonymous", "createdAt", "updatedAt"],
          });
        if (!user) {
          return res
            .status(401)
            .json({ message: "No user with the provided token" });
        }
        req.user = user;
        next();
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

module.exports = verifyAndGetUser;
