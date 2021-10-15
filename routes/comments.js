const express = require('express')
const Mongoose = require('mongoose')
const Comments = require('../models/comments')
const Posts = require('../models/posts')
const User = require('../models/user')
const authMiddleware = require('../middlewares/auth-middleware')

const router = express.Router()

//댓글 조회
router.get('/:post_id/comments', async (req, res) => {

  const { post_id } = req.params
  const comments = await Posts.findOne({ _id: post_id }).populate({
    path: 'comment_id',
    options: { sort: { date: -1 } },
  })

  res.json({ detail: comments['comment_id'] })

})

//댓글 작성
router.post('/:post_id/comments', authMiddleware, async (req, res) => {

  const { post_id } = req.params
  const { content } = req.body
  const { user } = res.locals
  const nickname = user.nickname
  let date = new Date().toISOString()

  try {
    const _id = new Mongoose.Types.ObjectId()
    await Comments.create({ _id, nickname, content, date })

    await Posts.findOneAndUpdate(
      { _id: post_id },
      { $push: { comment_id: _id } }
    )
  } catch (err) {
    console.error(err)
    res.send({ result: 'fail' })
  }

  res.send({ result: 'success' })
})

//댓글 수정
router.patch(
  '/:post_id/comments/:comment_id',
  authMiddleware,
  async (req, res) => {
    const { comment_id } = req.params

    const { content } = req.body
    const { user } = res.locals
    const nickname = user.nickname
    const c_nickname = await Comments.findOne({ _id: comment_id })
    let date = new Date().toISOString()
    console.log(c_nickname, nickname)


    if (c_nickname.nickname === nickname) {
      await Comments.updateMany(
        { _id: comment_id },
        { $set: { content, date } }
      )

      res.send({ result: 'success' })
    } else {
      res.send({ msg: '내 댓글이 아닙니다.' })
    }

  }
)

//댓글 삭제
router.delete(
  '/:post_id/comments/:comment_id',
  authMiddleware,
  async (req, res) => {

    const { post_id, comment_id } = req.params
    const { user } = res.locals
    const nickname = user.nickname
    const c_userId = await Comments.findOne({ _id: comment_id })


    if (c_userId.nickname === nickname) {
      await Posts.findOneAndUpdate(
        { _id: post_id },
        { $pull: { comment_id: comment_id } }
      )

      await Comments.deleteOne({ comment_id })
      res.send({ result: 'success' })
    } else {
      res.send({ msg: '내 댓글이 아닙니다.' })
    }

  }
)

module.exports = router

