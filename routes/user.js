const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const authMiddleware = require('../middlewares/auth-middleware');
const authmiddleware =  require("../middlewares/auth-middleware");
const user = require('../models/user');
const User = require('../models/user')
//POST  (/api/users)/auth
//DELETE  (/api/users)/auth
//POST  (/api/users)/signup
//GET  (/api/users)/me
/* GET users listing. */
// console.log("4")
//회원가입
router.post('/signup', async (req, res) => {
    const { nickname, email, password, confirmPassword} = req.body
    const nicknameregax = /^[a-zA-Z0-9가-힣]{3,}$/
    //이메일 벨리데이션도 정하자//
    const passwordregax = /^[a-zA-Z0-9]{4,}$/
    if(!nicknameregax.test(nickname)) {
        res.status(400).send({
            errorMessage: "형식에 맞게 입력해주세요!"
        })
        return
    }

    if (!passwordregax.test(password)) {
        res.status(400).send({
            errorMessage: '형식에 맞게 입력해주세요!'
        })
    }

    if (password !== confirmPassword) {
        res.status(400).send({
            errorMessage: "패스워드가 패스워드 확인란과 다릅니다."
        })
        alert("뿅")
        return
    }
try{
    const existsUsers = await User.findOne({email})
    if (existsUsers) {
        res.status(400).send({
            errorMessage: '이메일 또는 닉네임이 이미 사용중입니다.'
        })
        return
    }

    const user = await new User({email ,nickname, password})
    await user.save()

    res.status(201).send({})
  
} catch(error) { console.log(error)
}
});
// console.log("5")
//로그인
router.post('/auth', async (req, res) => {
    const{email, password} = req.body;
    // console.log(email)
    const user = await User.findOne({ email: email, }).exec();
    // console.log(user)
    // console.log("로그인 연결");
    if (!user || password !== user.password) {
        res.status(400).send({
            errorMessage: '이메일 또는 패스워드가 틀렸습니다',
        })
        return
    }
    const token = jwt.sign({userId: user.userId}, "team3_miniproject") //시크릿키 주의!!!
    const Id = user.userId
    // console.log("하이",user.userId)
    res.json({
        token
    }) //토큰이 안감
})
// console.log("6")
// 미들웨어 확인 

router.get("/me", authMiddleware, async (req,res) => {
    // console.log("하",res.locals)
    const {user} = res.locals //중간 데이터를 설정할 수 있으며, 해당 데이터를 뷰에서 사용할수 있음.
     //res.locals이 안찍힘 
    res.send({
        user: {
            email: user.email,
            nickname: user.nickname
        }
    })
})


module.exports = router;
