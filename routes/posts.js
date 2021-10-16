
const express = require('express')
const Mongoose = require('mongoose')
const Posts = require('../models/posts')
const User = require('../models/user')
const commentsRouter = require('./comments')
const authMiddleware = require('../middlewares/auth-middleware')
const orMiddleware = require('../middlewares/or-middleware')
const Postfunc = require('../lib/postfunc')

const router = express.Router()

router.use('/', [commentsRouter])

//게시글 조회
router.get('/', async (req, res) => {
  try {
    const posts = await Posts.find({}).sort('-date')


    for (let i = 0; i < posts.length; i++) {
      posts[i].update({ _id: posts[i]['_id'].toString() });
    }


    res.json({ posts: posts })
  } catch (err) {
    res.status(400).send({ result: '관리자에게 문의하세요!' })
  }
})

//myinfo 내 게시글 조회
router.get('/myinfo', authMiddleware, async (req, res) => {
  const { user } = res.locals
  const userId = user.userId
  const nickname = user.nickname
  try {
    const posts = await User.findOne({ _id: userId }).populate({
      path: 'post_id',
      options: { sort: { date: -1 } },
    })

    res.json({ posts: posts['post_id'] })
  } catch (err) {
    res.status(400).send({ result: '관리자에게 문의하세요!' })
  }
})

//내가 찜한 게시물 불러오기
router.get('/dibson', authMiddleware, async (req, res) => {
  const { user } = res.locals
  const userId = user.userId
  const nickname = user.nickname
  try {
    const posts = await User.findOne({ _id: userId }).populate({
      path: 'like_post',
      options: { sort: { date: -1 } },
    })

    res.json({ posts: posts['like_post'] })
  } catch (err) {
    res.status(400).send({ result: '관리자에게 문의하세요!' })
  }
})

//게시글 작성
router.post('/', authMiddleware, async (req, res) => {
  const { title, content, imgUrl, storeName, storeArea } = req.body
  const { user } = res.locals
  const userId = user.userId
  const nickname = user.nickname

  let date = new Date().toISOString()
  const _id = new Mongoose.Types.ObjectId()
  await User.findOneAndUpdate({ _id: userId }, { $push: { post_id: _id } })


  await Posts.create({
    _id,
    nickname,
    title,
    content,
    imgUrl,
    storeName,
    storeArea,
    date,

  })

  res.status(200).send({ result: 'success' })
})


//게시물 검색
router.post('/search', async (req, res) => {
  const {keyword} = req.body
  console.log(keyword)
  //검색내용을 공백으로 분리하여 전체 탐색
  const keywords = keyword.split(' ')

  const list_keywords = []
  console.log(list_keywords)
  for (let i = 0; i < keywords.length; i++) {
    list_keywords.push({
      $or: [
        { title: { $regex: keywords[i] } },
        { content: { $regex: keywords[i] } },
        { nickname: { $regex: keywords[i] } },
        { storeArea: { $regex: keywords[i] } },
        { storeName: { $regex: keywords[i] } },
      ],
    })
  }

  const search_posts = await Posts.find({ $or: list_keywords }).sort('-date')

  res.json({ posts: search_posts })
})


//게시물 삭제

router.delete('/:post_id', authMiddleware, async (req, res) => {
  const { post_id } = req.params
  const { user } = res.locals
  const nickname = user.nickname


  await User.findOneAndUpdate({ nickname }, { $pull: { like_post: post_id } })
  await User.findOneAndUpdate({ nickname }, { $pull: { post_id: post_id } })
  await Posts.deleteOne({ _id: post_id })


  res.send({ result: 'success' })
})

//게시물 수정
router.patch('/:post_id', authMiddleware, async (req, res) => {
  const { post_id } = req.params

  const { title, content, imgUrl, storeName, storeArea } = req.body
  

  const { user } = res.locals
  const nickname = user.nickname
  let date = new Date().toISOString()

  const [ispostid] = await Posts.find({ _id: post_id })

  
  if (ispostid.nickname == nickname) {
    await Posts.updateMany({ _id: post_id }, { $set: { title, content, imgUrl, storeName, storeArea } })
  }
  res.send({ result: 'success', date })
})

//게시물 상세 조회
router.get('/:post_id', orMiddleware, async (req, res) => {
  const { post_id } = req.params
  const { user } = res.locals

  Postfunc.loginDistinction( user, post_id, res )
 
})

//게시물 좋아요 기능
router.post('/:post_id', authMiddleware, async (req, res) => {
  const { post_id } = req.params
  const { likeState } = req.body
  const { user } = res.locals
  const userId = user.userId

  Postfunc.likeStateDistinction(likeState, post_id, userId, res)
})

module.exports = router

