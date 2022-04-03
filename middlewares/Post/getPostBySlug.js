const Post = require("../../models/Post");

const authorPopulate = require("../../populate/author");
const commentPopulate = require("../../populate/comment");
const threadPopulate = require("../../populate/thread");
const upvotePopulate = require("../../populate/upvote");
const downvotePopulate = require("../../populate/downvote");

const getPostBySlug = async (req, res, next) => {
  try {
    const postSlug = req.params.postSlug;
    const post = await Post.findOne({ slug: postSlug, thread: req.thread._id })
      .populate(threadPopulate)
      .populate(authorPopulate)
      .populate(commentPopulate)
      .populate(upvotePopulate)
      .populate(downvotePopulate)
      .sort({ createdAt: -1 });
    if (!post) return res.status(404).json({ error: "Idea not found" });
    req.post = post;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

module.exports = getPostBySlug;
