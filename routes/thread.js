const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const crypto = require("crypto");

const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Thread = require("../models/Thread");
const User = require("../models/User");

const creatorPopulate = require("../populate/creator");
const postPopulate = require("../populate/post");

const checkThreadForm = require("../middlewares/Validation/checkThreadForm");
const verifyAndGetUser = require("../middlewares/verifyAndGetUser");
const getThreadBySlug = require("../middlewares/Thread/getThreadBySlug");

const filterFalsey = require("../utils/filterFalsy");
const objectMap = require("../utils/objectMap");
const isSameUser = require("../utils/isSameUser");
const filterSpecialChar = require("../utils/filterSpecialChar");
const deepClone = require("../utils/deepClone");

const threadDTO = require("../dto/threadDTO");
const threadsDTO = require("../dto/threadsDTO");

const transporter = require("../transporter");
const getMailOptions = require("../mailOptions");

router.get("/", async (req, res) => {
  try {
    const searchObj = objectMap(
      filterFalsey(req.query),
      (value) => (value = new RegExp(value, "i"))
    );
    const threads = await Thread.find({ ...searchObj, approved: true })
      .populate(creatorPopulate)
      .populate(postPopulate);

    return res.status(200).json(threadsDTO(threads));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.post("/create", verifyAndGetUser, checkThreadForm, async (req, res) => {
  try {
    const { topic, description, postDeadline, commentDeadline } = req.body;
    const { user } = req;
    const userID = user._id;
    if (await Thread.exists({ slug: slugify(filterSpecialChar(topic)) })) {
      return res
        .status(400)
        .json({ error: "Thread with the same topic already exists" });
    }
    const thread = await Thread.create({
      topic,
      description,
      creator: userID,
      slug: slugify(filterSpecialChar(topic)) + "-" + Date.now(),
      approved: false,
      postDeadline,
      commentDeadline,
      createdAt: Date.now(),
    });
    if (!thread) {
      return res.status(500).json({ error: "Error creating thread" });
    }
    user.threads.push(thread._id);
    await user.save();
    const populatedThread = await Thread.findById(thread._id)
      .populate(creatorPopulate)
      .populate(postPopulate);

    const receivers = await User.find({
      role: ["admin", "coordinator"],
    }).select("email -_id");

    const subject = `New Thread: ${topic}`;
    const message = `${populatedThread.creator.username} has created a new thread: ${populatedThread.topic}!`;
    if (receivers.length > 0) {
      const mailOptions = getMailOptions(receivers, subject, message);
      transporter.sendMail(mailOptions);
    }
    return res.status(200).json(populatedThread);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.put(
  "/update/:threadSlug",
  verifyAndGetUser,
  checkThreadForm,
  getThreadBySlug,
  async (req, res) => {
    try {
      const { user, thread } = req;
      const { topic, description, postDeadline, commentDeadline } = req.body;

      const userID = user._id;
      const threadCreatorID = thread.creator._id;
      if (!isSameUser(userID, threadCreatorID)) {
        return res
          .status(403)
          .json({ error: "You are not authorized to update this thread." });
      }
      thread.topic = topic || thread.topic;
      thread.description = description || thread.description;
      thread.slug =
        slugify(filterSpecialChar(topic)) + "-" + Date.now() || thread.slug;
      thread.postDeadline = postDeadline || thread.postDeadline;
      thread.commentDeadline = commentDeadline || thread.commentDeadline;
      thread.updatedAt = Date.now();
      await thread.save();

      const populatedThread = await Thread.findById(thread._id)
        .populate(creatorPopulate)
        .populate(postPopulate);

      return res.status(200).json(threadDTO(populatedThread));
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.delete(
  "/delete/:threadSlug",
  verifyAndGetUser,
  getThreadBySlug,
  async (req, res) => {
    try {
      const { user, thread } = req;
      const userID = user._id;
      const threadCreatorID = thread.creator._id;
      if (!isSameUser(userID, threadCreatorID)) {
        return res
          .status(403)
          .json({ error: "You are not authorized to do this" });
      }

      await thread.remove();
      return res.status(200).json({ message: "Thread deleted" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.get("/:threadSlug", getThreadBySlug, (req, res) => {
  const { thread } = req;
  return res.status(200).json(threadDTO(thread));
});

module.exports = router;
