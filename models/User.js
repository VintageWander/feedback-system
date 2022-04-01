const { model, Schema } = require("mongoose");

const isEmail = require("../utils/isEmail");
const keepOneSpace = require("../utils/keepOneSpace");
const isInvalidCharacter = require("../utils/isInvalidCharacter");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [
      {
        validator: isEmail,
      },
    ],
  },
  username: {
    type: String,
    required: true,
    unique: true,
    validate: [
      {
        validator: (username) => {
          username = keepOneSpace(username);
          return !isInvalidCharacter(username);
        },
      },
    ],
  },
  password: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
  },
  role: {
    type: String,
    enum: ["staff", "admin", "manager", "coordinator"],
    default: "staff",
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  refreshToken: {
    type: String,
  },
  threads: [
    {
      type: Schema.Types.ObjectId,
      ref: "Thread",
    },
  ],
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  upvotedPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  downvotedPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  upvotedComments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  downvotedComments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  createdAt: {
    type: Number,
    immutable: true,
    required: true,
  },
  updatedAt: {
    type: Number,
    default: Date.now,
  },
});

userSchema.pre("remove", async function (next) {
  try {
    const Thread = require("./Thread");
    const threads = await Thread.find({ creator: this._id });
    if (threads) {
      threads.forEach(async (thread) => {
        await thread.remove();
      });
    }

    const Post = require("./Post");
    const posts = await Post.find({ creator: this._id });
    if (posts) {
      posts.forEach(async (post) => {
        await post.remove();
      });
    }

    const Comment = require("./Comment");
    const comments = await Comment.find({ creator: this._id });
    if (comments) {
      comments.forEach(async (comment) => {
        await comment.remove();
      });
    }

    this.model("Post")
      .updateMany(
        { upvotes: this._id },
        { $pull: { upvotes: this._id } },
        { multi: true }
      )
      .exec();

    this.model("Post")
      .updateMany(
        { downvotes: this._id },
        { $pull: { downvotes: this._id } },
        { multi: true }
      )
      .exec();

    this.model("Comment")
      .updateMany(
        { upvotes: this._id },
        { $pull: { upvotes: this._id } },
        { multi: true }
      )
      .exec();

    this.model("Comment")
      .updateMany(
        { downvotes: this._id },
        { $pull: { downvotes: this._id } },
        { multi: true }
      )
      .exec();

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
});

const User = model("User", userSchema);
module.exports = User;
