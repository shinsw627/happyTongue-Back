const express = require("express");
// console.log("1")
const app = express();
// const authmiddleware =  require("./middlewares/auth-middleware")

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static("public"));

const connect = require('./models'); 
connect();

const usersRouter = require('./routes/user');
app.use('/api/users', [usersRouter]);

//미들웨어 확인 
// app.get("/", authmiddleware, async (req,res) => {
//   res.status(400).send({});
// })

//렌더링
app.get("/", (req, res) => {
  // console.log("메인페이지 하하")
  res.render("index");
});

app.get('/signUp', (req, res) => {
  res.render("signUp.ejs")
})

app.get('/signIn',(req,res) => {
  // console.log("로그인 겟")
  res.render("signIn")
})
app.get('/me',(req,res) => {
  // console.log("사용자 확인")
  res.render("me")
})

//me.ejs 파일이 안그려진다는게 문제다!

const handleListen = () => {
  console.log(`서버가 요청을 받을 준비가 됐어요😀 http://localhost:8080`);
};
// console.log("2")
// module.exports = app;
app.listen(8080, handleListen);
// console.log("3")