import express from "express";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui"; //for admin ui
//import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpserver = http.createServer(app);
const io = new Server(httpserver, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});
instrument(io, {
  auth: false,
});
const handleListen = () => console.log(`Listening on http://localhost:3000`);

httpserver.listen(3000, handleListen);

//for socket.io (chatting)
// function publicRooms() {
//   const {
//     sockets: {
//       adapter: { sids, rooms },
//     },
//   } = io;
//   const publicRooms = [];
//   rooms.forEach((_, key) => {
//     if (sids.get(key) === undefined) {
//       publicRooms.push(key);
//     }
//   });
//   return publicRooms;
// }

// function countRoom(roomName) {
//   return io.sockets.adapter.rooms.get(roomName)?.size;
// }
// io.on("connection", (socket) => {
//   socket["nickname"] = "Anonymous";
//   socket.onAny((event) => {
//     //console.log(io.sockets.adapter);
//     console.log(`socket event: ${event}`);
//   });

//   socket.on("nickname", (nickname) => (socket["nickname"] = nickname));

//   socket.on("enter_room", (roomName, showRoom) => {
//     socket.join(roomName); //enter room
//     showRoom(); //done: front에서 실행되는 fn
//     socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); //본인을 제외한 나머지 user들에게 새로운 user 입장소식 전달
//     io.sockets.emit("room_change", publicRooms()); //서버안에 있는 모든 방을 모든 socket에 알려줌
//   });

//   socket.on("disconnecting", () => {
//     socket.rooms.forEach((room) => {
//       socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
//     });
//   });

//   socket.on("disconnet", () => {
//     io.sockets.emit("room_change", publicRooms());
//   });

//   socket.on("message", (roomName, msg, done) => {
//     socket.to(roomName).emit("message", `${socket.nickname}: ${msg}`);
//     done();
//   });
// });

//using wss
//const wss = new WebSocket.Server({ server }); //http 위에 websocket server 생성
//fake database
// const sockets = [];

// wss.on("connection", (socket) => {
//   //socket=연결된 브라우저
//   sockets.push(socket); //연결된 brower를 저장
//   socket["nickname"] = "Anonymous";

//   console.log("Connected to Browser✔");
//   socket.on("close", () => console.log("Disconnected to Browser ❌")); //browser창을 닫았을 때 실행

//   socket.on("message", (msg) => {
//     //msg: browser => server
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         ); //send: server=>browser
//         break;
//       case "nickname":
//         socket["nickname"] = message.payload;
//         break;
//     }
//   });
// });
