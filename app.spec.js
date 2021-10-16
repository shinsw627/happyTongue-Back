const app = require("./app");
const supertest = require("supertest");
const { TestWatcher } = require("jest");

// supertest(app).get("/index.html")

test("/index.html 경로에 요청 했을때, status code가 200이어야 한다", () => {
    //test
});

test("/test.html 경로에 요청했을때 status code가 404여야 한다.", () =>{
    //test
})
