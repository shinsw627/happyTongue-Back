const express = require("express");
const app = express();


const connect = require('./models');
connect();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.use('/', [indexRouter]);
app.use('/api/users', [usersRouter]);
app.use('/api/posts', [postsRouter]);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");


app.get("/", (req, res) => {
  res.render("index");
});

app.get("/write", (req, res) => {
  res.render("write");
});

app.get("/detail", (req, res) => {
  res.render("detail");
});

app.get("/correction", (req, res) => {
  res.render("correction");
});

const handleListen = () => {
  console.log(`서버가 요청을 받을 준비가 됐어요 http://localhost:8080`);
};

app.listen(8080, handleListen);
