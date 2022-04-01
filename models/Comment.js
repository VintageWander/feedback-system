const { model, Schema } = require("mongoose");

const commentSchema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
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
  anonymous: {
    type: Boolean,
    default: false,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
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

commentSchema.pre("remove", async function (next) {
  try {
    this.model("Post")
      .updateOne(
        { _id: this.post },
        { $pull: { comments: this._id } },
        { multi: true }
      )
      .exec();

    this.model("User")
      .updateMany(
        { upvotedComments: this._id },
        { $pull: { upvotedComments: this._id } },
        { multi: true }
      )
      .exec();

    this.model("User")
      .updateMany(
        {
          downvotedComments: this._id,
        },
        {
          $pull: {
            downvotedComments: this._id,
          },
        },
        { multi: true }
      )
      .exec();

    this.model("User")
      .updateMany(
        { _id: this.author },
        { $pull: { comments: this._id } },
        { multi: true }
      )
      .exec();

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
});

const Comment = model("Comment", commentSchema);
module.exports = Comment;
