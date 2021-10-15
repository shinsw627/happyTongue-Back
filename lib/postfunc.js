const User = require('../models/user')
const Posts = require('../models/posts')

exports.likeStateDistinction = async function(likeState, post_id, userId, res){
    if (likeState == 'false') {
        try {
          await Posts.findOneAndUpdate(
            { _id: post_id },
            { $push: { like_id: userId } }
          )
          await User.findOneAndUpdate(
            { _id: userId },
            { $push: { like_post: post_id } }
          )
          res.status(200).send({ msg: 'success' })
        } catch (err) {
          res.status(400).send({ msg: '관라자에게 문의하세요!' })
        }
      } else {
        try {
          await Posts.findOneAndUpdate(
            { _id: post_id },
            { $pull: { like_id: userId } }
          )
          await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { like_post: post_id } }
          )
          res.status(200).send({ msg: 'success' })
        } catch (err) {
          res.status(400).send({ msg: '관리자에게 문의하세요!' })
        }
      }
}

exports.loginDistinction = async function (user, post_id, res) {
  let likeState = false
  const posts = await Posts.findOne({ _id: post_id })
  const postlike = posts.like_id
  const likes = postlike.length
  if (!user) {
    res.json({ detail: posts, likes })
  } else {
    const userId = user.userId
    for (let i = 0; i < postlike.length; i++) {
      if (postlike[i].toString() == userId) {
        console.log(postlike[i].toString())
        likeState = true
      }
    }
    res.json({ detail: posts, likeState, likes })
  }
}
