const jwt = require("jsonwebtoken")
const User = require("../models/user")

module.exports = (req,res,next) => {
    const{authorization} = req.headers;
    console.log("미들웨어다",authorization)
    const [tokenType, tokenValue] = authorization.split(' ');
    // console.log(tokenType);
    if (tokenType !== 'Bearer') {
        console.log("미들웨어가 안먹힘")
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요',
        })
        return;
    }
    try {
        console.log("미들웨어 지나갑니다!")
        const {userId} = jwt.verify(tokenValue, "team3_miniproject");
        console.log("미들웨어",userId)
        User.findById(userId).exec().then((user)=>{
                // console.log("미들웨어 유저", user)
                res.locals.user = user;
                console.log("마지막 테스트",res.locals.user)
                next()
            });
    } catch (error) {
        console.log("미들웨어 오류 났네요!")
        res.status(401).send({
            errorMessage: "로그인 후 사용하세요!"
        })
        return;
    }
};

//미들웨어 문제!