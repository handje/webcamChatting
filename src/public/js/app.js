const socket = io(); // io: 자동적으로 backend socket.io와 연결

//room
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");

  //socket.io 는 특정 event를 emit 할 수 있음, object 전달 가능, 원하는 정보 모두 전달 가능
  //socket.emit(name,payload,etc,,,,,fn(for server))
  socket.emit("enter_room", { payload: input.value }, () => {
    console.log("server is done"); //front에서 실행되는 fn (서버가 실행시켜줌)
  });
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

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
