const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const ObjectsToCSV = require("objects-to-csv");
const AdmZip = require("adm-zip");
const fs = require("fs");

const User = require("../models/User");
const Thread = require("../models/Thread");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const cloudinary = require("../cloudinary");

const authorPopulate = require("../populate/author");
const commentPopulate = require("../populate/comment");
const threadPopulate = require("../populate/thread");
const upvotePopulate = require("../populate/upvote");
const downvotePopulate = require("../populate/downvote");

const postPopulate = require("../populate/post");
const creatorPopulate = require("../populate/creator");

const threadDTO = require("../dto/threadDTO");
const threadsDTO = require("../dto/threadsDTO");
const postDTO = require("../dto/postDTO");
const postsDTO = require("../dto/postsDTO");
const commentDTO = require("../dto/commentDTO");
const commentsDTO = require("../dto/commentsDTO");

const getThreadBySlug = require("../middlewares/Thread/getThreadBySlug");
const mustBe = require("../middlewares/Validation/mustBe");

const deepClone = require("../utils/deepClone");
const objectMap = require("../utils/objectMap");
const filterFalsey = require("../utils/filterFalsy");
const isBool = require("../utils/isBool");
const isNumber = require("../utils/isNumber");
const downloadFile = require("../utils/downloadFile");

router.get("/threads", mustBe(["admin", "manager"]), async (req, res) => {
  try {
    const searchObj = objectMap(
      filterFalsey(req.query),
      (value) => (value = new RegExp(value, "i"))
    );
    const threads = await Thread.find(searchObj)
      .populate(creatorPopulate)
      .populate(postPopulate);

    return res.status(200).json(threadsDTO(threads));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.get(
  "/threads/:threadSlug",
  mustBe(["admin", "manager"]),
  getThreadBySlug,
  async (req, res) => {
    try {
      const { thread } = req;
      return res.status(200).json(threadDTO(thread));
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.put(
  "/threads/update/:threadSlug",
  // role checking
  mustBe(["admin", "manager"]),
  getThreadBySlug,
  async (req, res) => {
    try {
      // take the thread from the request
      const { thread } = req;
      // take the 2 deadlines for the post, with the approved status,
      // from the update form
      const { postDeadline, commentDeadline, approved } = req.body;

      // form validation before updating the thread
      if (!postDeadline || !commentDeadline) {
        return res
          .status(400)
          .json({ error: "Both deadline for post and comment are required" });
      }
      if (!isNumber(postDeadline) || !isNumber(commentDeadline)) {
        return res
          .status(400)
          .json({ error: "Deadlines must be a long number" });
      }
      const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      if (postDeadline < twoDaysFromNow || commentDeadline < twoDaysFromNow) {
        return res
          .status(400)
          .json({ error: "Idea or comment deadline must be at least 2 days" });
      } else if (
        postDeadline > twoWeeksFromNow ||
        commentDeadline > twoWeeksFromNow
      ) {
        return res
          .status(400)
          .json({ error: "Idea or comment deadline must be at most 2 weeks" });
      }
      if (approved === undefined) {
        return res.status(400).json({ error: "Approved field is required" });
      }
      if (!isBool(approved)) {
        return res
          .status(400)
          .json({ error: "Approved field must be a boolean" });
      }

      // updates the thread
      thread.postDeadline = postDeadline || thread.postDeadline;
      thread.commentDeadline = commentDeadline || thread.commentDeadline;
      thread.approved = approved;
      thread.updatedAt = Date.now();

      // saves the result to the database
      await thread.save();

      const populatedThread = await Thread.findById(thread._id)
        .populate(creatorPopulate)
        .populate(postPopulate);

      // return the appropriate response
      return res.status(200).json(threadDTO(populatedThread));
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.delete(
  "/threads/delete/:threadSlug",
  mustBe(["admin", "manager"]),
  getThreadBySlug,
  async (req, res) => {
    try {
      const { thread } = req;
      await thread.remove();
      return res.status(200).json({
        message: "Thread deleted successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.get("/posts", mustBe(["admin", "manager"]), async (req, res) => {
  try {
    const searchObj = objectMap(
      filterFalsey(req.query),
      (value) => (value = new RegExp(value, "i"))
    );
    let posts = await Post.find(searchObj)
      .populate(threadPopulate)
      .populate(authorPopulate)
      .populate(commentPopulate)
      .populate(upvotePopulate)
      .populate(downvotePopulate);

    return res.status(200).json(postsDTO(posts));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.get(
  "/posts/export-csv",
  mustBe(["admin", "manager"]),
  async (req, res) => {
    try {
      const posts = await Post.find()
        .select("-anonymous")
        .populate(threadPopulate)
        .populate(authorPopulate)
        .populate(commentPopulate)
        .populate(upvotePopulate)
        .populate(downvotePopulate)
        .sort({ createdAt: -1 });

      const clonedPosts = postsDTO(posts);
      const data = [];
      clonedPosts.forEach((post) => {
        data.push({
          Thread: post.thread.topic,
          Creator: post.thread.creator.username,
          "Idea Deadline": new Date(
            post.thread.postDeadline + 7 * 60 * 60 * 1000
          ).toLocaleString(),
          "Comment Deadline": new Date(
            post.thread.commentDeadline + 7 * 60 * 60 * 1000
          ).toLocaleString(),
          Title: post.title,
          Content: post.content.split(",").join("%&%&") + ".",
          Author: post.author.username,
          Role: post.author.role,
          "Upvote count": post.upvotes.length,
          "Downvote count": post.downvotes.length,
          "Created at": new Date(
            post.createdAt + 7 * 60 * 60 * 1000
          ).toLocaleString(),
          "Updated at": new Date(
            post.updatedAt + 7 * 60 * 60 * 1000
          ).toLocaleString(),
        });
      });

      const csv = new ObjectsToCSV(data);

      if (!(await csv.toString())) {
        return res.status(400).json({
          error: "No posts are available to export",
        });
      }

      console.log(new Date().toLocaleString());

      const filename = `posts.csv`;

      await csv.toDisk(`./${filename}`);
      //change all comma to semi colon in the file
      const file = fs.readFileSync(`./${filename}`, "utf-8");
      const newFile = file.replace(/,/g, ";").replace(/%&%&/g, ",");

      fs.writeFileSync(`./${filename}`, "\uFEFF" + newFile);

      await cloudinary.uploader.destroy(`${filename}`);
      const result = await cloudinary.uploader.upload(`./${filename}`, {
        resource_type: "auto",
        unique_filename: false,
        use_filename: true,
      });

      fs.unlinkSync(`./${filename}`);

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.get(
  "/posts/export-attachments",
  mustBe(["admin", "manager"]),
  async (req, res) => {
    try {
      const posts = await Post.find()
        .select("-anonymous")
        .populate(threadPopulate)
        .populate(authorPopulate)
        .populate(commentPopulate)
        .populate(upvotePopulate)
        .populate(downvotePopulate)
        .sort({ createdAt: -1 });

      let promiseArray = [];
      posts.forEach((post) => {
        post.files.forEach((file) => {
          promiseArray.push(
            downloadFile(file.url, `./downloads/${file.url.split("/").pop()}`)
          );
        });
      });

      await Promise.all(promiseArray);

      const files = fs.readdirSync("./downloads");

      const zip = new AdmZip();

      files.forEach((file) => {
        if (file === ".gitkeep") return;
        zip.addLocalFile(`./downloads/${file}`);
      });

      const filename = `attachments.zip`;

      zip.writeZip(`./out/${filename}`);

      await cloudinary.uploader.destroy(`${filename}`);
      const result = await cloudinary.uploader.upload(`./out/${filename}`, {
        resource_type: "auto",
        unique_filename: false,
        use_filename: true,
      });

      fs.unlinkSync(`./out/${filename}`);

      files.forEach((file) => {
        if (file === ".gitkeep") return;
        fs.unlinkSync(`./downloads/${file}`);
      });

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.get(
  "/posts/:postSlug",
  mustBe(["admin", "manager"]),
  async (req, res) => {
    try {
      const post = await Post.findOne({ slug: req.params.postSlug })
        .populate(threadPopulate)
        .populate(authorPopulate)
        .populate(commentPopulate)
        .populate(upvotePopulate)
        .populate(downvotePopulate);
      if (!post) {
        return res.status(404).json({ error: "Idea not found" });
      }

      return res.status(200).json(postDTO(post));
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.delete(
  "/posts/delete/:postSlug",
  mustBe(["admin", "manager"]),
  async (req, res) => {
    try {
      const post = await Post.findOne({ slug: req.params.postSlug });
      if (!post) {
        return res.status(404).json({ error: "Idea not found" });
      }
      await post.remove();
      return res.status(200).json({ message: "Idea deleted successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error });
    }
  }
);

router.get("/comments", mustBe(["admin", "manager"]), async (req, res) => {
  try {
    const searchObj = objectMap(
      filterFalsey(req.query),
      (value) => (value = new RegExp(value, "i"))
    );
    const comments = await Comment.find(searchObj)
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

router.get(
  "/comments/:commentSlug",
  mustBe(["admin", "manager"]),
  async (req, res) => {
    try {
      const comment = await Comment.findOne({ slug: req.params.commentSlug })
        .populate({
          path: "post",
          select: ["title", "content", "slug", "author", "anonymous"],
          populate: authorPopulate,
        })
        .populate(authorPopulate)
        .populate(upvotePopulate)
        .populate(downvotePopulate);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      return res.status(200).json(commentDTO(comment));
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error });
    }
  }
);

router.delete(
  "/comments/delete/:commentSlug",
  mustBe(["admin", "manager"]),
  async (req, res) => {
    try {
      const comment = await Comment.findOne({ slug: req.params.commentSlug });
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      await comment.remove();
      return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

router.get("/users", mustBe(["admin"]), async (req, res) => {
  try {
    const searchObj = objectMap(
      filterFalsey(req.query),
      (value) => (value = new RegExp(value, "i"))
    );
    const users = await User.find(searchObj)
      .select(["-password", "-refreshToken"])
      .populate({
        path: "threads",
        select: [
          "topic",
          "description",
          "slug",
          "postDeadline",
          "commentDeadline",
          "approved",
        ],
      })
      .populate({
        path: "posts",
        select: ["title", "content", "slug", "anonymous"],
      })
      .populate({
        path: "comments",
        select: ["title", "content", "slug", "anonymous"],
      })
      .populate({
        path: "upvotedPosts",
        select: ["title", "content", "slug", "anonymous"],
      })
      .populate({
        path: "downvotedPosts",
        select: ["title", "content", "slug", "anonymous"],
      })
      .populate({
        path: "upvotedComments",
        select: ["title", "content", "slug", "anonymous"],
      })
      .populate({
        path: "downvotedComments",
        select: ["title", "content", "slug", "anonymous"],
      });

    if (!users) {
      return res.status(404).json({ error: "User not found" });
    }

    const clonedUsers = deepClone(users);
    clonedUsers.forEach((user) => {
      user.posts = user.posts.filter((post) => post.anonymous === false);
      user.comments = user.comments.filter(
        (comment) => comment.anonymous === false
      );
    });

    return res.status(200).json(clonedUsers);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.get("/users/:userSlug", mustBe(["admin"]), async (req, res) => {
  try {
    const user = await User.findOne({ slug: req.params.userSlug })
      .select("-password", "-refreshToken")
      .populate({
        path: "threads",
        select: [
          "topic",
          "description",
          "slug",
          "postDeadline",
          "commentDeadline",
          "approved",
        ],
      })
      .populate({
        path: "posts",
        select: ["title", "content", "slug", "anonymous"],
      })
      .populate({
        path: "comments",
        select: ["title", "content", "slug", "anonymous"],
      })
      .populate({
        path: "upvotedPosts",
        select: ["title", "content", "slug", "anonymous"],
      })
      .populate({
        path: "downvotedPosts",
        select: ["title", "content", "slug", "anonymous"],
      })
      .populate({
        path: "upvotedComments",
        select: ["title", "content", "slug", "anonymous"],
      })
      .populate({
        path: "downvotedComments",
        select: ["title", "content", "slug", "anonymous"],
      });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const clonedUser = deepClone(user);
    clonedUser.posts = clonedUser.posts.filter(
      (post) => post.anonymous === false
    );
    clonedUser.comments = clonedUser.comments.filter(
      (comment) => comment.anonymous === false
    );

    return res.status(200).json(clonedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.put("/users/update/:userSlug", mustBe(["admin"]), async (req, res) => {
  try {
    const user = await User.findOne({ slug: req.params.userSlug });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }
    if (["admin", "staff", "coordinator", "manager"].includes(role)) {
      user.role = role;
    }
    user.updatedAt = Date.now();
    await user.save();

    return res.status(200).json({ message: "User role updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
});

router.delete(
  "/users/delete/:userSlug",
  mustBe(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findOne({ slug: req.params.userSlug });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await user.remove();
      return res.status(200).json({ message: "User deleted" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
);

module.exports = router;
