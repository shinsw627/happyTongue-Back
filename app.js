
const express = require('express')
const app = express()
const http = require('http')
const cors = require('cors')
require('dotenv').config()
const server = http.createServer(app)
const PORT = process.env.PORT
// console.log("1")

// const authmiddleware = require("./middlewares/auth-middleware")
const connect = require('./models')
connect()

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/user')
const postsRouter = require('./routes/posts')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('public'))
app.use(cors())

app.use('/', [indexRouter])
app.use('/api/users', [usersRouter])
app.use('/api/posts', [postsRouter])

app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

//미들웨어 확인
// app.get("/", authmiddleware, async (req,res) => {
//   res.status(400).send({});
// })

// 렌더링
app.get('/', (req, res) => {
  res.render('index')
})

app.get('/write', (req, res) => {
  res.render('write')
})

app.get('/detail', (req, res) => {
  res.render('detail')
})

app.get('/myinfo', (req, res) => {
  res.render('myinfo')
})

app.get('/dibson', (req, res) => {
  res.render('dibson')
})

app.get('/correction', (req, res) => {
  res.render('correction')
})

app.get('/signUp', (req, res) => {
  res.render('signUp')
})

app.get('/signIn', (req, res) => {
  // console.log("로그인 겟")
  res.render('signIn')
})
app.get('/me', (req, res) => {
  // console.log("사용자 확인")
  res.render('me')
})

//me.ejs 파일이 안그려진다는게 문제다!

const handleListen = () => {
  console.log(`서버가 요청을 받을 준비가 됐어요😀 http://localhost:8080`)
}
// console.log("2")
// module.exports = app;
server.listen(PORT, handleListen)


