const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const crypto = require("crypto");

const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Thread = require("../models/Thread");

const checkCommentForm = require("../middlewares/Validation/checkCommentForm");

const verifyAndGetUser = require("../middlewares/verifyAndGetUser");
const getCommentBySlug = require("../middlewares/Comment/getCommentBySlug");

const authorPopulate = require("../populate/author");
const upvotePopulate = require("../populate/upvote");
const downvotePopulate = require("../populate/downvote");

const transporter = require("../transporter");
const getMailOptions = require("../mailOptions");

const commentDTO = require("../dto/commentDTO");
const commentsDTO = require("../dto/commentsDTO");

const filterFalsey = require("../utils/filterFalsy");
const objectMap = require("../utils/objectMap");
const isSameUser = require("../utils/isSameUser");
const filterArrayByID = require("../utils/filterArrayByID");
const filterSpecialChar = require("../utils/filterSpecialChar");
const deepClone = require("../utils/deepClone");

router.get("/", async (req, res) => {
  try {
    const postID = req.post._id;
    const searchObj = objectMap(
      filterFalsey(req.query),
      (value) => (value = new RegExp(value, "i"))
    );

    const comments = await Comment.find({
      ...searchObj,
      post: postID,
    })
      .populate({
        path: "post",
        select: ["title", "content", "slug", "author", "anonymous"],
        populate: authorPopulate,
      })
      .populate(authorPopulate)
      .populate(upvotePopulate)
      .populate(downvotePopulate);

    return res.status(200).json(commentsDTO(comments));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.post("/create", checkCommentForm, verifyAndGetUser, async (req, res) => {
  try {
    const { title, content, anonymous } = req.body;
    const { user, thread, post } = req;
    const userID = user._id;
    const postID = post._id;
    if (await Comment.exists({ slug: slugify(title) })) {
      return res
        .status(400)
        .json({ error: "Comment with the same title already exists" });
    }
    if (thread.commentDeadline < Date.now()) {
      return res
        .status(400)
        .json({ error: "Deadline for commenting has passed" });
    }

    const comment = await Comment.create({
      title,
      content,
      author: userID,
      post: postID,
      anonymous,
      slug: slugify(filterSpecialChar(title)) + "-" + Date.now(),
      createdAt: Date.now(),
    });

    if (!comment) {
      return res.status(500).json({ error: "Comment could not be created" });
    }

    post.comments.push(comment._id);
    await post.save();
    user.comments.push(comment._id);
    await user.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate({
        path: "post",
        select: ["title", "content", "slug", "author", "anonymous"],
        populate: authorPopulate,
      })
      .populate(authorPopulate)
      .populate(upvotePopulate)
      .populate(downvotePopulate);

    const receiver = post.author.email;

    const isSelf = isSameUser(userID, populatedComment.author._id);

    const subject = `New comment on your post: ${post.title}!`;

    const message = `${
      populatedComment.anonymous
        ? "Someone anonymous has"
        : isSelf
        ? "You have"
        : populatedComment.author.username + " has"
    } commented on your ${isSelf && "own"} post: ${
      post.title
    }. Come check it out!`;

    if (receiver) {
      const mailOptions = getMailOptions(receiver, subject, message);
      transporter.sendMail(mailOptions);
    }

    return res.status(200).json(commentDTO(populatedComment));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.put(
  "/update/:commentSlug",
  checkCommentForm,
  verifyAndGetUser,
  getCommentBySlug,
  async (req, res) => {
    try {
      const { title, content, anonymous } = req.body;
      const { user, thread, comment } = req;
      const userID = user._id;
      const commentAuthorID = comment.author._id;

      if (!isSameUser(userID, commentAuthorID)) {
        return res
          .status(403)
          .json({ error: "You are not authorized to do this" });
      }
      if (thread.commentDeadline < Date.now()) {
        return res
          .status(400)
          .json({ error: "Deadline for commenting has passed" });
      }
      comment.title = title || comment.title;
      comment.content = content || comment.content;
      comment.slug =
        slugify(filterSpecialChar(title)) + "-" + Date.now() || comment.slug;
      comment.anonymous = anonymous;
      comment.updatedAt = Date.now();

      await comment.save();

      const populatedComment = await Comment.findById(comment._id)
        .populate({
          path: "post",
          select: ["title", "content", "slug", "author", "anonymous"],
          populate: authorPopulate,
        })
        .populate(authorPopulate)
        .populate(upvotePopulate)
        .populate(downvotePopulate);

      return res.status(200).json(commentDTO(populatedComment));
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.delete(
  "/delete/:commentSlug",
  verifyAndGetUser,
  getCommentBySlug,
  async (req, res) => {
    try {
      const { user, post, comment } = req;
      const userID = user._id;
      const commentAuthorID = comment.author._id;
      if (!isSameUser(userID, commentAuthorID)) {
        return res
          .status(403)
          .json({ error: "You are not authorized to do this" });
      }
      if (post.deadline < Date.now()) {
        return res.status(400).json({ error: "Deadline has passed" });
      }

      await comment.remove();
      return res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.post(
  "/upvote/:commentSlug",
  verifyAndGetUser,
  getCommentBySlug,
  async (req, res) => {
    try {
      const { user, thread, comment } = req;
      if (thread.commentDeadline < Date.now()) {
        return res
          .status(400)
          .json({ error: "Deadline for upvoting comments has passed" });
      }
      const userID = user._id;
      const isUpvoted = comment.upvotes.some(
        (upvoteUser) => upvoteUser._id.toString() === userID.toString()
      );
      const isDownvoted = comment.downvotes.some(
        (downvoteUser) => downvoteUser._id.toString() === userID.toString()
      );
      if (isUpvoted) {
        comment.upvotes = filterArrayByID(comment.upvotes, userID);
        user.upvotedComments = filterArrayByID(
          user.upvotedComments,
          comment._id
        );
        await comment.save();
        await user.save();
        return res.status(200).json({ message: "Unvote comment successfully" });
      }
      if (isDownvoted) {
        comment.downvotes = filterArrayByID(comment.downvotes, userID);
        user.downvotedComments = filterArrayByID(
          user.downvotedComments,
          comment._id
        );
      }
      comment.upvotes.push(userID);
      user.upvotedComments.push(comment._id);
      await comment.save();
      await user.save();
      return res.status(200).json({ message: "Comment upvoted" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.post(
  "/downvote/:commentSlug",
  verifyAndGetUser,
  getCommentBySlug,
  async (req, res) => {
    try {
      const { user, thread, comment } = req;
      if (thread.commentDeadline < Date.now()) {
        return res
          .status(400)
          .json({ error: "Deadline for downvoting comments has passed" });
      }
      const userID = user._id;
      const isUpvoted = comment.upvotes.some(
        (upvoteUser) => upvoteUser._id.toString() === userID.toString()
      );
      const isDownvoted = comment.downvotes.some(
        (downvoteUser) => downvoteUser._id.toString() === userID.toString()
      );
      if (isDownvoted) {
        comment.downvotes = filterArrayByID(comment.downvotes, userID);
        user.downvotedComments = filterArrayByID(
          user.downvotedComments,
          comment._id
        );
        await comment.save();
        await user.save();
        return res.status(200).json({ message: "Unvote comment successfully" });
      }
      if (isUpvoted) {
        comment.upvotes = filterArrayByID(comment.upvotes, userID);
        user.upvotedComments = filterArrayByID(
          user.upvotedComments,
          comment._id
        );
      }
      comment.downvotes.push(userID);
      user.downvotedComments.push(comment._id);
      await comment.save();
      await user.save();
      return res.status(200).json({ message: "Comment downvoted" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.get("/:commentSlug", getCommentBySlug, async (req, res) => {
  const { comment } = req;
  return res.status(200).json(commentDTO(comment));
});

module.exports = router;
