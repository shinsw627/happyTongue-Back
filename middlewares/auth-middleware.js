const jwt = require("jsonwebtoken")
const User = require("../models/user")

module.exports = (req,res,next) => {
    const{authorization} = req.headers;
    const [tokenType, tokenValue] = authorization.split(' ');
    console.log("토큰타입",tokenType);
    if (tokenType !== 'Bearer') {
        console.log("미들웨어 연결이 되지 않았습니다")
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요',
        })
        return;
    }
    try {
        const {userId} = jwt.verify(tokenValue, process.env.MY_SECRET_KEY);
        console.log("userId",userId)
        User.findById(userId).exec().then((user)=>{
                res.locals.user = user;
                console.log("사용자 정보 ",res.locals.user)
                next()
            });
    } catch (error) {
        console.log("미들웨어 연결이 되지 않았습니다")
        res.status(401).send({
            errorMessage: "로그인 후 사용하세요!"
        })
        return;
    }
};
