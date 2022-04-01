const Comment = require("../../models/Comment");

const authorPopulate = require("../../populate/author");
const upvotePopulate = require("../../populate/upvote");
const downvotePopulate = require("../../populate/downvote");

const getCommentBySlug = async (req, res, next) => {
  try {
    const commentSlug = req.params.commentSlug;
    const comment = await Comment.findOne({
      slug: commentSlug,
      post: req.post._id,
    })
      .populate({
        path: "post",
        select: ["title", "content", "slug", "author", "anonymous"],
        populate: authorPopulate,
      })
      .populate(authorPopulate)
      .populate(upvotePopulate)
      .populate(downvotePopulate);

    if (!comment) return res.status(404).json({ error: "Comment not found" });
    req.comment = comment;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

module.exports = getCommentBySlug;
