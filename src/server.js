import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

//for websocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); //http 위에 websocket server 생성

//fake database
const sockets = [];

wss.on("connection", (socket) => {
  //socket=연결된 브라우저
  sockets.push(socket); //연결된 brower를 저장
  socket["nickname"] = "Anonymous";

  console.log("Connected to Browser✔");
  socket.on("close", () => console.log("Disconnected to Browser ❌")); //browser창을 닫았을 때 실행

  socket.on("message", (msg) => {
    //msg: browser => server
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        ); //send: server=>browser
        break;
      case "nickname":
        socket["nickname"] = message.payload;
        break;
    }
  });
});

server.listen(3000, handleListen);
