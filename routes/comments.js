const express = require('express')
const Mongoose = require('mongoose')
const Comments = require('../models/comments')
const Posts = require('../models/posts')
const User = require('../models/user')

const router = express.Router()

//댓글 조회
router.get('/:post_id/comments', async (req, res) => {
    const { post_id } = req.params
    console.log(post_id)
    const comments = await Posts.findOne({ _id: post_id }).populate({
      path: 'comment_id',
      options: { sort: { date: -1 } },
    })
  
    res.json({ detail: comments['comment_id'] })
})

//댓글 작성
router.post('/:post_id/comments', async (req, res) => {
    const {post_id} = req.params
    console.log(post_id)
    const { content } = req.body
    // const { user } = res.locals
    // const userId = user.userId
    let date = new Date().toISOString()
  
    try {
      const _id = new Mongoose.Types.ObjectId()
      await Comments.create({ _id, content, date })
    //   await User.findOneAndUpdate(
    //     { userId: userId },
    //     { $push: { comment_id: _id } }
    //   )
      await Posts.findOneAndUpdate(
        { _id: post_id },
        { $push: { comment_id: _id } }
      )
    } catch (err) {
      console.error(err)
      console.log('여기?')
      // next(err);
      res.send({ result: 'fail' })
    }
    console.log('요기?')
    res.send({ result: 'success' })
})

//댓글 수정 
router.patch('/:post_id/comments/:comment_id', async (req, res) => {
    const { post_id, comment_id } = req.params
    console.log(post_id, comment_id)
    const { content } = req.body
    // const { user } = res.locals
    // const userId = user.userId
    // const c_userId = await Comments.findOne({ _id: comment_id })
    let date = new Date().toISOString()
  
    // if (c_userId.userId === userId) {
      await Comments.updateMany({ _id: comment_id }, { $set: { content, date } })
      res.send({ result: 'success' })
    // } else {
    //   res.send({ msg: '내 댓글이 아닙니다.' })
    // }
})

//댓글 삭제
router.delete('/:post_id/comments/:comment_id', async (req, res) => {
    const { post_id, comment_id } = req.params
    // const { comment_id } = req.body
    // const { user } = res.locals
    // const userId = user.userId
    const c_userId = await Comments.findOne({ _id: comment_id })
  
    // if (c_userId.userId === userId) {
      await Posts.findOneAndUpdate({ _id: post_id }, { $pull: { comment_id: comment_id } })
      await Comments.deleteOne({ comment_id })
      res.send({ result: 'success' })
    // } else {
    //   res.send({ msg: '내 댓글이 아닙니다.' })
    // }
})

module.exports = router;