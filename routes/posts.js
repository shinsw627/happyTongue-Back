const express = require('express');
const Mongoose = require('mongoose');
const Posts = require('../models/posts');
const User = require('../models/user');

const router = express.Router();

//게시글 조회
router.get('/', async (req, res, next) => {
  try {
    const posts = await Posts.find({}).sort('-date');

    for (let i = 0; i < posts.length; i++) {
      posts[i].update({ _id: posts[i]['_id'].toString() });
    }

    res.json({ posts: posts });
  } catch (err) {
    next(err);
  }
});

//게시글 작성
router.post('/', authMiddleware, async (req, res) => {
  const { title, content, imgUrl, storName, storeArea } = req.body;
  const { user } = res.locals;
  const nickname = user.userId;

  let date = new Date().toISOString();
  const _id = new Mongoose.Types.ObjectId();
  await User.findOneAndUpdate({ nickname }, { $push: { postId: _id } });

  await Posts.create({
    _id,
    nickname,
    title,
    content,
    imgUrl,
    storName,
    storArea,
    date,
  });

  res.status(200).send({ result: 'success' });
});

module.exports = router;
