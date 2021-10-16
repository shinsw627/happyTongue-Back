const express = require("express");
const dotenv= require("dotenv")
const app = express();
dotenv.config();


//미들웨어
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("views", __dirname + "/views"); 
app.set("view engine", "ejs");
app.use(express.static("public")); 

//몽고디비
const connect = require('./models'); 
connect();

//라우터연결
const usersRouter = require('./routes/user');
app.use('/api/users', [usersRouter]);


//렌더링
app.get("/", (req, res) => {
  res.render("index");
});

app.get('/signUp', (req, res) => {
  res.render("signUp.ejs")
})

app.get('/signIn',(req,res) => {
  res.render("signIn")
})
app.get('/me',(req,res) => {
  res.render("me")
})


const handleListen = () => {
  console.log(`서버가 요청을 받을 준비가 됐어요😀 http://localhost:8080`);
};

app.listen(process.env.PORT || 8080, handleListen);
