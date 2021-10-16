const jwt = require('jsonwebtoken')
const User = require('../models/user')
const SECRET_KEY = process.env.MY_SECRET_KEY

async function Authenticate(req, res, next) {
  const { authorization } = req.headers
  if (authorization == 'Bearer null') {
    next()
  } else {
    const [tokenType, tokenValue] = authorization.split(' ')
    const { userId } = jwt.verify(tokenValue, SECRET_KEY)
    User.findById(userId)
      .exec()
      .then((user) => {
        res.locals.user = user
        next()
      })
  }
}

module.exports = Authenticate
