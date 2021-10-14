const express = require("express");
const Mongoose = require("mongoose");
const Posts = require("../models/posts");
const User = require("../models/user");
const commentsRouter = require("./comments");
const authMiddleware = require("../middlewares/auth-middleware");

const router = express.Router();

router.use("/", [commentsRouter]);

//게시글 조회
router.get("/", async (req, res,) => {
  try {
    const posts = await Posts.find({}).sort("-date").limit(20);

    // for (let i = 0; i < posts.length; i++) {
    //   posts[i].update({ _id: posts[i]["_id"].toString() });
    // }

    res.json({ posts: posts });
  } catch (err) {
    res.status(400).send({result:'관리자에게 문의하세요!'});
  }
});

//myinfo 내 게시글 조회
router.get("/myinfo", authMiddleware, async (req, res,) => {
  const { user } = res.locals;
  const userId = user.userId;
  const nickname = user.nickname;
  try {
    const posts = await User.findOne({ _id: userId }).populate({
        path: "post_id",
        options: { sort: { date: -1 } },
    })
      

    // for (let i = 0; i < posts.length; i++) {
    //   posts[i].update({ _id: posts[i]["_id"].toString() });
    // }
    console.log(posts)
    res.json({ posts: posts['post_id'], nickname });
  } catch (err) {
    res.status(400).send({result:'관리자에게 문의하세요!'});
  }
});

//내가 찜한 게시물 불러오기
router.get("/dibsOn", authMiddleware, async (req, res,) => {
  const { user } = res.locals;
  const userId = user.userId;
  const nickname = user.nickname;
  try {
    const posts = await User.findOne({ _id: userId }).populate({
        path: "like_post",
        options: { sort: { date: -1 } },
    })
      

    // for (let i = 0; i < posts.length; i++) {
    //   posts[i].update({ _id: posts[i]["_id"].toString() });
    // }
    console.log(posts)
    res.json({ posts: posts['like_post']});
  } catch (err) {
    res.status(400).send({result:'관리자에게 문의하세요!'});
  }
});

//게시글 작성
router.post("/", authMiddleware, async (req, res) => {
  const { title, content, imgUrl, storeName, storeArea } = req.body;
  const { user } = res.locals;
  const userId = user.userId;
  const nickname = user.nickname;

  let date = new Date().toISOString();
  const _id = new Mongoose.Types.ObjectId();
  await User.findOneAndUpdate({ _id: userId }, { $push: { post_id: _id } });

  await Posts.create({
    _id,
    nickname,
    title,
    content,
    imgUrl,
    storeName,
    storeArea,
    date,
  });

  res.status(200).send({ result: "success" });
});

//게시물 검색
router.get("/search/:keyword", async (req, res, next) => {
  const { keyword } = req.params;
  const keywords = keyword.split(" ");
  const list_keywords = [];
  for (let i = 0; i < keywords.length; i++) {
    list_keywords.push({
      $or: [
        { title: { $regex: keywords[i] } },
        { content: { $regex: keywords[i] } },
      ],
    });
  }
  const search_posts = await Posts.find({ $or: list_keywords }).sort("-date");

  res.json({ posts: search_posts });
});

//delete post
router.delete("/:post_id", authMiddleware, async (req, res) => {
  const { post_id } = req.params;
  const { user } = res.locals;
  const nickname = user.nickname;

  await User.findOneAndUpdate({ nickname }, { $pull: { like_post: post_id } });
  await User.findOneAndUpdate({ nickname }, { $pull: { post_id: post_id } });
  await Posts.deleteOne({ _id: post_id });

  res.send({ result: "success" });
});

//게시물 수정
router.patch("/:post_id", authMiddleware, async (req, res) => {
  const { post_id } = req.params;
  const { title, content } = req.body;
  const { user } = res.locals;
  const nickname = user.nickname;
  let date = new Date().toISOString();

  const [ispostid] = await Posts.find({ _id: post_id });
  console.log(ispostid, nickname, user);
  if (ispostid.nickname == nickname) {
    await Posts.updateMany(
      { _id: post_id },
      { $set: { title, content, date } }
    );
  }
  res.send({ result: "success" });
});

//detail post
router.get("/:post_id", authMiddleware, async (req, res) => {
  const { post_id } = req.params;
  const { user } = res.locals;
  const userId = user.userId;
  let likeState = false;

  const posts = await Posts.findOne({ _id: post_id });

  const postlike = posts.like_id;
  for (let i = 0; i < postlike.length; i++) {
    if (postlike[i].toString() == userId) {
      console.log(postlike[i].toString());
      likeState = true;
    }
  }

  const likes = postlike.length;
  
  res.json({ detail: posts, likeState, likes });
});

//like post
router.post("/:post_id", authMiddleware, async (req, res) => {
  const { post_id } = req.params;
  const { likeState } = req.body;
  const { user } = res.locals;
  const userId = user.userId;

  if (likeState == "false") {
    try {
      await Posts.findOneAndUpdate(
        { _id: post_id },
        { $push: { like_id: userId } }
      );
      await User.findOneAndUpdate(
        { _id: userId },
        { $push: { like_post: post_id } }
      );
      res.status(200).send({ msg: "success" });
    } catch (err) {
      res.status(400).send({ msg: "관라자에게 문의하세요!" });
    }
  } else {
    try {
      await Posts.findOneAndUpdate(
        { _id: post_id },
        { $pull: { like_id: userId } }
      );
      await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { like_post: post_id } }
      );
      res.status(200).send({ msg: "success" });
    } catch (err) {
      res.status(400).send({ msg: "관리자에게 문의하세요!" });
    }
  }
});

module.exports = router;
