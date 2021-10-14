const jwt = require("jsonwebtoken")
const User = require("../models/user");

async function Authenticate(req, res, next) {
    const { authorization } = req.headers;
  if (authorization == 'Bearer null') {
    console.log("미들웨어다 헤더 없다")
    next()
  } else {
    console.log("미들웨어다",authorization)
    const [tokenType, tokenValue] = authorization.split(" ");
    const { userId } = jwt.verify(tokenValue, "team3_miniproject");
    User.findById(userId)
      .exec()
      .then((user) => {
        res.locals.user = user;
        next();
    });
  }
}

module.exports = Authenticate;