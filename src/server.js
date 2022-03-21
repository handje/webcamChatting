import express from "express";
import { handle } from "express/lib/application";
import http from "http";
import WebSocket from "ws";
// import { render } from "express/lib/response";
// import path from "path";

//const __dirname = path.resolve();

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

//for websocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); //http 위에 websocket server 생성

wss.on("connection", (socket) => {
  //socket=연결된 브라우저
  console.log("Connected to Browser✔");
  socket.on("close", () => console.log("Disconnected to Browser ❌")); //browser창을 닫았을 때 실행
  socket.on("message", (message) => {
    console.log(message.toString("utf8"));
  }); //browser => server
  socket.send("hello!"); //socket's method, server=>browser
});

server.listen(3000, handleListen);
