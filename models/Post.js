const { model, Schema } = require("mongoose");
const cloudinary = require("../cloudinary");

const postSchema = new Schema({
  thread: {
    type: Schema.Types.ObjectId,
    ref: "Thread",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  files: [
    {
      type: Object,
      required: false,
    },
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  anonymous: {
    type: Boolean,
    default: false,
    required: true,
  },
  upvotes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  downvotes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
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
postSchema.pre("remove", async function (next) {
  try {
    this.model("Thread")
      .updateOne(
        { _id: this.thread },
        { $pull: { posts: this._id } },
        { multi: true }
      )
      .exec();

    this.model("User")
      .updateMany(
        { _id: this.author },
        { $pull: { posts: this._id } },
        { multi: true }
      )
      .exec();

    this.model("User")
      .updateMany(
        { upvotedPosts: this._id },
        { $pull: { upvotedPosts: this._id } },
        { multi: true }
      )
      .exec();

    this.model("User")
      .updateMany(
        {
          downvotedPosts: this._id,
        },
        {
          $pull: {
            downvotedPosts: this._id,
          },
        },
        { multi: true }
      )
      .exec();
    const Comment = require("./Comment");
    const comments = await Comment.find({ post: this._id });
    if (comments) {
      comments.forEach(async (comment) => {
        await comment.remove();
      });
    }
    let promiseArray = [];
    await this.files.forEach(async (file) => {
      console.log(file.public_id);
      promiseArray.push(
        cloudinary.uploader.destroy(file.public_id, {
          resource_type: file.public_id.includes(".") ? "raw" : "image",
        })
      );
    });
    await Promise.all(promiseArray)
      .then((results) => {
        console.log(results);
        next();
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

const Post = model("Post", postSchema);
module.exports = Post;
