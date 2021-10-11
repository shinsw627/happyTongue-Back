const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

const handleListen = () => {
  console.log(`서버가 요청을 받을 준비가 됐어요 http://localhost:8080`);
};

app.listen(8080, handleListen);
