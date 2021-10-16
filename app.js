const express = require('express')
const app = express()
const http = require('http')
const cors = require('cors')
require('dotenv').config()
const server = http.createServer(app)

const moment = require('moment')
const PORT = process.env.PORT
const Chat = require('./models/chat')
const Chatbackup = require('./models/chatbackup.js')
const { Server } = require('socket.io')

const io = new Server(server, {
  cors: { orgin: '*' },
})
// console.log("1")

// const authmiddleware = require("./middlewares/auth-middleware")
const connect = require('./models')
connect()

const usersRouter = require('./routes/user')
const postsRouter = require('./routes/posts')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('public'))
app.use(cors())

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
app.get('/chat', (req, res) => {
  res.render('chat')
})

//기간이 오래된(10일이 지난) 채팅로그는 삭제하는 함수
//데이터는 백업DB에 저장
const deleteOldChat = async () => {
  try {
    const chats = await Chat.find().sort('date').exec()
    const dateNow = Date.now()
    const deadLine = dateNow - 86400000

    for (let i = 0; i < chats.length; i++) {
      const chat = chats[i]
      if (chat.date < deadLine) {
        const { nickname, msg, time, order, date } = chat
        await Chatbackup.create({
          nickname,
          msg,
          order,
          time,
          date,
        })
      }
    }

    await Chat.deleteMany({ date: { $lte: deadLine } })
  } catch (err) {
    console.error(err)
  }
}

//채팅 기록 100개 이상시 절반으로 만드는 타노스 함수
//데이터는 백업DB에 저장
const deleteMaxChat = async () => {
  try {
    const chats = await Chat.find().sort('-order').exec()
    if (chats.length > 0) {
      const maxi = chats[0].order
      const mini = chats[chats.length - 1].order
      const halfOrder = (maxi + mini) / 2
      if (chats.length > 100) {
        const ChatBackupDatas = await Chat.find({
          order: { $lte: halfOrder },
        })
          .sort('-order')
          .exec()
        for (let i = 0; i < ChatBackupDatas.length; i++) {
          const ChatBackupData = ChatBackupDatas[i]
          if (ChatBackupData.order < halfOrder) {
            const { nickname, msg, time, order, date } = ChatBackupData
            await Chatbackup.create({
              nickname,
              msg,
              order,
              time,
              date,
            })
          }
        }

        await Chat.deleteMany({ order: { $lte: halfOrder } }).exec()
      }
    }
  } catch (err) {
    console.error(err)
  }
}

const showChatLog = async () => {
  try {
    const chats = await Chat.find().sort('order').exec()

    await io.emit('chatLog', chats)
  } catch (err) {
    console.error(err)
  }
}

const currentOn = []
const currentOnUserInfo = []

io.on('connection', (socket) => {
  deleteMaxChat()
  deleteOldChat()
  io.emit('currentOn', currentOn)
  socket.on('join', (nickname) => {
    showChatLog()
    const userNickname = nickname
    const userSocketId = {
      // 특정 닉네임에게만 보내는 이벤트를 위한 socket.id저장
      nickname: userNickname,
      socketId: socket.id,
    }
    if (currentOn.indexOf(userNickname) === -1) {
      //현재 접속자에 유저아이디가 없으면 추가
      currentOnUserInfo.push(userSocketId)
      currentOn.push(userNickname)
      io.emit('currentOn', currentOn) // 현재 접속자 리스트 업데이트
    } else {
      // refresh 할때마다 socket.id가 바뀌므로 같이 업데이트 해주는작업
      for (let i in currentOnUserInfo) {
        if (currentOnUserInfo[i].nickname === userNickname) {
          currentOnUserInfo[i].socketId = userSocketId.socketId
        }
      }
    }
  })

  //연결 해제시에 발생하는 이벤트
  socket.on('disconnect', () => {
    // 현재 socket.id랑 연결되어있는 닉네임이 있는 배열에서 제거
    for (let i in currentOnUserInfo) {
      if (currentOnUserInfo[i].socketId === socket.id) {
        currentOn.splice(currentOn.indexOf(currentOnUserInfo[i].nickname), 1)
        currentOnUserInfo.splice(currentOnUserInfo[i], 1)
      }
    }
    io.emit('currentOn', currentOn)
    console.log('나갔음') //브라우저를 끄거나 탭을 닫으면 disconnect 작동하는지 검사
  })

  //두번째로 백엔드에서 받기
  socket.on('sendMsg', async (data) => {
    try {
      deleteMaxChat()
      const { nickname, msg } = data
      const maxOrder = await Chat.findOne({}).sort('-order').exec()
      let order = 1

      if (maxOrder) {
        order = maxOrder.order + 1
      }
      const time = moment(new Date()).format('h:mm A')
      const date = Date.now()

      await Chat.create({ nickname, msg, order, time, date })
      //세번재 백엔드에서 프론트로 보내기
      io.emit('receiveMsg', {
        nickname: nickname,
        msg: msg,
        time: time,
      })
    } catch (err) {
      console.error(err)
    }
  })
})

const handleListen = () => {
  console.log(`서버가 요청을 받을 준비가 됐어요😀 http://localhost:8080`)
}
// console.log("2")
// module.exports = app;
server.listen(PORT, handleListen)
