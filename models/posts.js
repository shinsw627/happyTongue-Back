const mongoose = require('mongoose');

const { Schema } = mongoose;
const postsSchema = new Schema({
  _id: Schema.Types.ObjectId,

  nickname: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  img_url: {
    type: String,
  },
  stor_name: {
    type: String,
  },
  stor_area: {
    type: String,
  },
  comment_id: [
    {
      type: Schema.Types.ObjectId,
      ref: 'comments',
    },
  ],
});

module.exports = mongoose.model('posts', postsSchema);
