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
router.post('/', async (req, res) => {
  const { title, content, imgUrl, storeName, storeArea } = req.body;
  // const { user } = res.locals;
  // const nickname = user.userId;

  let date = new Date().toISOString();
  const _id = new Mongoose.Types.ObjectId();
  // await User.findOneAndUpdate({ nickname }, { $push: { postId: _id } });
  console.log(imgUrl, storeName, storeArea)
  await Posts.create({
    _id,
    // nickname,
    title,
    content,
    imgUrl,
    storeName,
    storeArea,
    date,
  });

  res.status(200).send({ result: 'success' });
});

//게시물 검색
router.get('/search/:keyword', async (req, res, next) => {
  const { keyword } = req.params
  const keywords = keyword.split(' ')
  console.log(keyword)
  const list_keywords = []
  for (let i = 0; i < keywords.length; i++) {
    list_keywords.push({
      $or: [
        { title: { $regex: keywords[i] } },
        { content: { $regex: keywords[i] } },
      ],
    })
  }
  console.log(list_keywords)
  const search_posts = await Posts.find({ $or: list_keywords }).sort('-date')

  res.json({ posts: search_posts })
})

//게시물 삭제
router.delete('/:_id', async (req, res) => {
  const { _id } = req.params
  const { user } = res.locals
  const userId = user.userId

  await User.findOneAndUpdate({ userId }, { $pull: { post_id: _id } })
  await Posts.deleteOne({ _id })

  res.send({ result: 'success' })
})

//게시물 수정
router.patch('/:_id', async (req, res) => {
  const { _id } = req.params
  const { user_id, title, content } = req.body
  let date = new Date().toISOString()

  const ispostid = await Posts.find({ _id })
  if (ispostid.length > 0) {
    await Posts.updateMany({ _id }, { $set: { title, content, date } })
  }
  res.send({ result: 'success' })
})

module.exports = router;
