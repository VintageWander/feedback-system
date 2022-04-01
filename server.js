const express = require("express");
const mongoose = require("mongoose");

const swaggerUI = require("swagger-ui-express");

const helmet = require("helmet");
const cors = require("cors");

const User = require("./models/User");
const Thread = require("./models/Thread");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

const getThreadBySlug = require("./middlewares/Thread/getThreadBySlug");
const getPostBySlug = require("./middlewares/Post/getPostBySlug");
const verifyAndGetUser = require("./middlewares/verifyAndGetUser");

const options = require("./swagger/options");

require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(helmet());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.redirect("/threads");
});

app.post("/test", (req, res) => {
  console.log(req.headers);
  console.log(req.body);
  return res.status(200).json({ message: "test" });
});

app.get("/batch_update", async (req, res) => {
  // try {
  //   const obj = await Thread.findOne({
  //     slug: "test-cascade-1647801977385",
  //   });
  //   await obj.remove();
  //   return res.status(200).json({ message: "success" });
  // } catch (err) {
  //   console.log(err);
  //   return res.status(500).json({ message: err.message });
  // }
  return res.status(200).json({ message: "success" });
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(options));
app.use("/auth", require("./routes/authentication"));
app.use("/my-profile", require("./routes/profile"));
app.use("/threads", require("./routes/thread"));
app.use(
  "/threads/:threadSlug/posts",
  getThreadBySlug,
  require("./routes/post")
);
app.use(
  "/threads/:threadSlug/posts/:postSlug/comments",
  getThreadBySlug,
  getPostBySlug,
  require("./routes/comment")
);
app.use("/manage", verifyAndGetUser, require("./routes/manage"));

const port = process.env.PORT || 5001;
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
  console.log(`Server running on port ${port}`);
  mongoose
    .connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));
});
