const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");

const User = require("../models/User");
const Comment = require("../models/Comment");
const Thread = require("../models/Thread");
const Post = require("../models/Post");

const verifyAndGetUser = require("../middlewares/verifyAndGetUser");
const getPostBySlug = require("../middlewares/Post/getPostBySlug");
const checkPostForm = require("../middlewares/Validation/checkPostForm");

const filterFalsey = require("../utils/filterFalsy");
const objectMap = require("../utils/objectMap");
const isSameUser = require("../utils/isSameUser");
const filterArrayByID = require("../utils/filterArrayByID");
const filterSpecialChar = require("../utils/filterSpecialChar");
const deepClone = require("../utils/deepClone");

const transporter = require("../transporter");
const getMailOptions = require("../mailOptions");
const upload = require("../upload");
const cloudinary = require("../cloudinary");

const postDTO = require("../dto/postDTO");
const postsDTO = require("../dto/postsDTO");

const authorPopulate = require("../populate/author");
const commentPopulate = require("../populate/comment");
const threadPopulate = require("../populate/thread");
const upvotePopulate = require("../populate/upvote");
const downvotePopulate = require("../populate/downvote");

router.get("/", async (req, res) => {
  try {
    const threadID = req.thread._id;
    const searchObj = objectMap(
      filterFalsey(req.query),
      (value) => (value = new RegExp(value, "i"))
    );

    let posts = await Post.find({
      ...searchObj,
      thread: threadID,
      approved: true,
    })
      .populate(threadPopulate)
      .populate(authorPopulate)
      .populate(commentPopulate)
      .populate(upvotePopulate)
      .populate(downvotePopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json(postsDTO(posts));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.post(
  "/create",
  upload.array("files", 25),
  checkPostForm,
  verifyAndGetUser,
  async (req, res) => {
    try {
      const { title, content, anonymous } = req.body;
      const { user, thread } = req;
      let uploadedFiles = [];

      const userID = user._id;
      const threadID = thread._id;

      if (thread.postDeadline < Date.now()) {
        return res
          .status(400)
          .json({ error: "Deadline for posting has passed" });
      }
      if (req.files.length > 0) {
        const files = req.files;
        const promiseArray = [];
        files.forEach((file) => {
          promiseArray.push(
            cloudinary.uploader.upload(file.path, {
              resource_type: "auto",
              allowed_formats: ["jpg", "png", "docx", "pdf", "yaml", "zip"],
              use_filename: true,
              unique_filename: true,
            })
          );
        });
        const results = await Promise.all(promiseArray);
        files.forEach((file) => fs.unlink(file.path, (err) => {}));
        results.forEach((result) => uploadedFiles.push(result));
      }
      const post = await Post.create({
        author: userID,
        thread: threadID,
        title,
        content,
        anonymous,
        files: uploadedFiles || [],
        slug: slugify(filterSpecialChar(title)) + "-" + Date.now(),
        createdAt: Date.now(),
      });

      await thread.posts.push(post._id);
      await thread.save();
      await user.posts.push(post._id);
      await user.save();

      const populatedPost = await Post.findById(post._id)
        .populate(threadPopulate)
        .populate(authorPopulate)
        .populate(commentPopulate)
        .populate(upvotePopulate)
        .populate(downvotePopulate)
        .sort({ createdAt: 1 });

      const receivers = await User.find({
        role: ["admin", "coordinator"],
      }).select("email -_id");

      const subject = `New post in thread ${thread.topic}`;

      const message = `${
        populatedPost.anonymous
          ? "Someone anonymous"
          : populatedPost.author.username
      } has posted in ${populatedPost.thread.topic}: ${populatedPost.title}!`;

      const mailOptions = getMailOptions(receivers, subject, message);
      transporter.sendMail(mailOptions);

      return res.status(200).json(postDTO(populatedPost));
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error });
    }
  }
);

router.put(
  "/update/:postSlug",
  upload.array("files", 25),
  checkPostForm,
  verifyAndGetUser,
  getPostBySlug,
  async (req, res) => {
    try {
      const { title, content, anonymous } = req.body;
      const { user, thread, post } = req;
      const userID = user._id;
      const postID = post.author._id;

      if (!isSameUser(userID, postID)) {
        return res
          .status(403)
          .json({ error: "You are not authorized to do this" });
      }

      if (thread.postDeadline < Date.now()) {
        return res
          .status(400)
          .json({ error: "Deadline for posting has passed" });
      }

      post.title = title || post.title;
      post.content = content || post.content;
      post.slug =
        slugify(filterSpecialChar(title)) + "-" + Date.now() || post.slug;
      post.anonymous = anonymous;
      post.updatedAt = Date.now();

      if (req.files.length > 0) {
        const files = req.files;
        let promiseArray = [];

        post.files.forEach((file) => {
          promiseArray.push(
            cloudinary.uploader.destroy(file.public_id, {
              resource_type: file.public_id.includes(".") ? "raw" : "image",
            })
          );
        });

        await Promise.all(promiseArray).catch((err) => {
          console.log(err);
          return res.status(400).json({ err });
        });

        promiseArray = [];
        post.files = [];

        files.forEach((file) => {
          promiseArray.push(
            cloudinary.uploader.upload(file.path, {
              resource_type: "auto",
              allowed_formats: [
                "jpg",
                "jpeg",
                "png",
                "docx",
                "doc",
                "pdf",
                "yaml",
              ],
              use_filename: true,
              unique_filename: true,
            })
          );
        });

        const results = await Promise.all(promiseArray);
        files.forEach((file) => fs.unlink(file.path, (err) => {}));
        results.forEach((result) => {
          post.files.push(result);
        });
      }

      await post.save();

      return res.status(200).json(postDTO(post));
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.delete(
  "/delete/:postSlug",
  verifyAndGetUser,
  getPostBySlug,
  async (req, res) => {
    try {
      const { user, thread, post } = req;
      const userID = user._id;
      const postID = post.author._id;

      if (!isSameUser(userID, postID)) {
        return res
          .status(403)
          .json({ error: "You are not authorized to do this" });
      }

      if (thread.postDeadline < Date.now()) {
        return res.status(400).json({ error: "Deadline has passed" });
      }

      await post.remove();
      return res.status(200).json({ message: "Post deleted" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.post(
  "/upvote/:postSlug",
  verifyAndGetUser,
  getPostBySlug,
  async (req, res) => {
    try {
      const { user, thread, post } = req;

      if (thread.postDeadline < Date.now()) {
        return res
          .status(400)
          .json({ error: "Deadline for upvoting posts has passed" });
      }

      const userID = user._id;

      const isUpvoted = post.upvotes.some(
        (upvoteUser) => upvoteUser._id.toString() === userID.toString()
      );

      const isDownvoted = post.downvotes.some(
        (downvoteUser) => downvoteUser._id.toString() === userID.toString()
      );

      if (isUpvoted) {
        post.upvotes = filterArrayByID(post.upvotes, userID);
        user.upvotedPosts = filterArrayByID(user.upvotedPosts, post._id);
        await post.save();
        await user.save();
        return res.status(200).json({ message: "Unvote post successfully" });
      }

      if (isDownvoted) {
        post.downvotes = filterArrayByID(post.downvotes, userID);
        user.downvotedPosts = filterArrayByID(user.downvotedPosts, post._id);
      }

      post.upvotes.push(userID);
      user.upvotedPosts.push(post._id);

      await post.save();
      await user.save();

      return res.status(200).json({ message: "Post upvoted" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.post(
  "/downvote/:postSlug",
  verifyAndGetUser,
  getPostBySlug,
  async (req, res) => {
    try {
      const { user, thread, post } = req;
      if (thread.postDeadline < Date.now()) {
        return res
          .status(400)
          .json({ error: "Deadline for downvoting posts has passed" });
      }
      const userID = user._id;
      const isUpvoted = post.upvotes.some(
        (upvoteUser) => upvoteUser._id.toString() === userID.toString()
      );
      const isDownvoted = post.downvotes.some(
        (downvoteUser) => downvoteUser._id.toString() === userID.toString()
      );
      if (isDownvoted) {
        post.downvotes = filterArrayByID(post.downvotes, userID);
        user.downvotedPosts = filterArrayByID(user.downvotedPosts, post._id);
        await post.save();
        await user.save();
        return res.status(200).json({ message: "Unvote post successfully" });
      }
      if (isUpvoted) {
        post.upvotes = filterArrayByID(post.upvotes, userID);
        user.upvotedPosts = filterArrayByID(user.upvotedPosts, post._id);
      }
      post.downvotes.push(userID);
      user.downvotedPosts.push(post._id);
      await post.save();
      await user.save();
      return res.status(200).json({ message: "Post downvoted" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.get("/:postSlug", getPostBySlug, async (req, res) => {
  const { post } = req;
  return res.status(200).json(postDTO(post));
});

module.exports = router;
