const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const CookieParser = require('cookie-parser');
const routes = require('./routes');
const app = express();
const port = 3000;

const Authenticate = require('./middlewares/Authentication');
const OnlyAuthenticated = require('./middlewares/OnlyAuthenticated');
const OnlyAnonymous = require('./middlewares/OnlyAnonymous');


const connect = require('./schema');
const Board = require('./schema/Board');
connect();


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.use(expressLayouts);

app.use(CookieParser('keyboard cat'))
app.set('trust proxy', 1);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

app.use(Authenticate);

app.use('/api', routes)

// 게시판 호출
app.get('/', (req, res) => {
    res.render('./board/list', { user: req.user });
});

// 게시판 쓰기
app.get('/boards/new', OnlyAuthenticated, (req, res) => {
    res.render('./board/editor', { editor: true, user: req.user });
});

// 게시판 읽기
app.get('/boards/:boardId', async (req, res) => {
    let boardId = req.params.boardId;
    const board = await Board.findById(boardId).populate('writer');
    res.render('./board/detail', { boardId, board, user: req.user });
});

// 회원가입
app.get('/sign-up', OnlyAnonymous, (req, res) => {
    res.render('./auth/sign-up', { isAuthPath: true });
});

// 로그인
app.get('/sign-in', OnlyAnonymous, (req, res) => {
    res.render('./auth/sign-in', { isAuthPath: true });
})

// 게시판 수정
app.get('/boards/:boardId/edit', OnlyAuthenticated, async (req, res) => {
    let boardId = req.params.boardId;
    const board = await Board.findById(boardId).populate('writer');
    res.render('./board/editor', { boardId, board, user: req.user });
});

module.exports = app;
