const socket = io(); // io: 자동적으로 backend socket.io와 연결

//room
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

//msg
const room = document.getElementById("room");
let roomName;

room.hidden = true; //방 입장 전

//화면에 msg출력
function addMsg(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

//send msg
function handleMsgSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("input");
  const msg = input.value; //input value를 비우기전의 값을 넘겨주기 위해
  socket.emit("message", roomName, input.value, () => {
    addMsg(`You: ${msg}`);
  });
  input.value = "";
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room: ${roomName}`;
  const form = room.querySelector("form");
  form.addEventListener("submit", handleMsgSubmit);
}

//send roomname
function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");

  //socket.io 는 특정 event를 emit 할 수 있음, object 전달 가능, 원하는 정보 모두 전달 가능
  //socket.emit(name,payload,etc,,,,,fn(for server))
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
  addMsg("someone joined!");
});

socket.on("bye", () => {
  addMsg("someone left!");
});

socket.on("message", addMsg);
//------------------using wss-----------------------------------------------------------------
// const socket = new WebSocket(`ws://${window.location.host}`); //socket=서버로의 연결
// const nickname = document.querySelector("#nickname");
// const messageList = document.querySelector("ul");
// const messageForm = document.querySelector("#msg");

// socket.addEventListener("open", () => {
//   console.log("Connected to Server ✔");
// });

// //disconnect to server
// socket.addEventListener("close", () => {
//   console.log("Disconnected to Server ❌");
// });

// //receive msg
// socket.addEventListener("message", (message) => {
//   const li = document.createElement("li");
//   li.innerText = message.data;
//   messageList.append(li);
// });

// //object를 string형태로 backend에 전달 : 모든 서버가 읽을 수 있는 형태로 전달하기 위해
// function makeMessage(type, payload) {
//   const msg = { type, payload };
//   return JSON.stringify(msg);
// }

// //nick submit event
// function handleNickname(event) {
//   event.preventDefault();
//   const input = nickname.querySelector("input");
//   //send JSON Object
//   socket.send(makeMessage("nickname", input.value));
//   input.value = "";
// }

// //msg submit event
// function handleSubmit(event) {
//   event.preventDefault();
//   const input = messageForm.querySelector("input");
//   socket.send(makeMessage("new_message", input.value)); //browser => server
//   input.value = "";
// }

// nickname.addEventListener("submit", handleNickname);
// messageForm.addEventListener("submit", handleSubmit);
