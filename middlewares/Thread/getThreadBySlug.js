const Thread = require("../../models/Thread");

const creatorPopulate = require("../../populate/creator");
const postPopulate = require("../../populate/post");

const getThreadBySlug = async (req, res, next) => {
  try {
    const threadSlug = req.params.threadSlug;
    const thread = await Thread.findOne({
      slug: threadSlug,
    })
      .populate(creatorPopulate)
      .populate(postPopulate);
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    req.thread = thread;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

module.exports = getThreadBySlug;
