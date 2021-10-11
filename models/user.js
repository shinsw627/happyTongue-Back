const mongoose = require('mongoose');

const { Schema } = mongoose;
const usersSchema = new Schema({
  nickname: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: Number,
    required: true,
  },
  post_id: [
    {
      type: Schema.Types.ObjectId,
      ref: 'posts',
    },
  ],
});

module.exports = mongoose.model('users', usersSchema);
