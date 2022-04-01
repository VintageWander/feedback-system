const { model, Schema } = require("mongoose");

const threadSchema = new Schema({
  topic: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  postDeadline: {
    type: Number,
    required: true,
  },
  commentDeadline: {
    type: Number,
    required: true,
  },
  approved: {
    type: Boolean,
    default: false,
    required: true,
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
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

threadSchema.pre("remove", async function (next) {
  try {
    this.model("User")
      .updateOne(
        { _id: this.creator },
        { $pull: { threads: this._id } },
        { multi: true }
      )
      .exec();

    const Post = require("./Post");
    const posts = await Post.find({ thread: this._id });
    if (posts) {
      posts.forEach(async (post) => {
        await post.remove();
      });
    }
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
});

const Thread = model("Thread", threadSchema);
module.exports = Thread;
