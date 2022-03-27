const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");
const chat=document.getElementById("chat");

call.hidden = true;
chat.hidden=true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;
let message;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

//join a room

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  chat.hidden=false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

socket.on("welcome", async () => {
  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", (event) => {
    console.log(event.data);
    showMsg(event.data);
  });
  console.log("made data channel");
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", (event) =>
      {
      console.log(event.data);
      showMsg(event.data);
      }
    );
  });
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
});

socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

// RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
}

function handleSendMsg(event){
  event.preventDefault();
  const input = chatForm.querySelector("input");
  message=input.value;
  myDataChannel.send(input.value);
  showMsg(input.value);
  input.value="";
}

function showMsg(event){
  const ul = chat.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = event;
  ul.appendChild(li);
}
const chatForm = chat.querySelector("form");
chatForm.addEventListener("submit",handleSendMsg);

//-------------------------chatting : using socket.io-------------------------------------------------
//------home.pug-----
// div#welcome
//                 form
//                     input(placeholder="room name", required, type="text")
//                     button Enter Room
//                 h4 Open Rooms
//                 ul
//             div#room
//                 h3
//                 ul
//                 form#nickname
//                     input(placeholder="nickname", required, type="text")
//                     button Ok
//                 form#msg
//                     input(placeholder="message", required, type="text")
//                     button Send

//------app.js----------------
// const socket = io(); // io: 자동적으로 backend socket.io와 연결

// //room
// const welcome = document.getElementById("welcome");
// const form = welcome.querySelector("form");

// //msg
// const room = document.getElementById("room");
// const nick = document.getElementById("nickname");
// const msgBox = document.getElementById("msg");

// let roomName;

// room.hidden = true; //방 입장 전

// //화면에 msg출력
// function addMsg(message) {
//   const ul = room.querySelector("ul");
//   const li = document.createElement("li");
//   li.innerText = message;
//   ul.appendChild(li);
// }

// //send msg
// function handleMsgSubmit(event) {
//   event.preventDefault();
//   const input = room.querySelector("#msg input");
//   const msg = input.value; //input value를 비우기전의 값을 넘겨주기 위해
//   socket.emit("message", roomName, input.value, () => {
//     addMsg(`You: ${msg}`);
//   });
//   input.value = "";
// }

// //nickname
// function handleNickNameSubmit(event) {
//   event.preventDefault();
//   msgBox.hidden = false;

//   const input = room.querySelector("#nickname input");
//   socket.emit("nickname", input.value);
//   socket.emit("enter_room", roomName, showRoom);
// }

// //room
// function showRoom() {
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room: ${roomName}`;
//   const msgForm = room.querySelector("#msg");
//   msgForm.addEventListener("submit", handleMsgSubmit);
// }

// //send roomname
// function handleRoomSubmit(event) {
//   event.preventDefault();
//   const input = form.querySelector("input");

//   welcome.hidden = true;
//   room.hidden = false;
//   msgBox.hidden = true;

//   const nickNameForm = room.querySelector("#nickname");
//   nickNameForm.addEventListener("submit", handleNickNameSubmit);
//   //socket.io 는 특정 event를 emit 할 수 있음, object 전달 가능, 원하는 정보 모두 전달 가능
//   //socket.emit(name,payload,etc,,,,,fn(for server))

//   roomName = input.value;
//   input.value = "";
// }

// function changeRoomTitle(newCount) {
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room: ${roomName} (${newCount})`;
// }

// form.addEventListener("submit", handleRoomSubmit);

// socket.on("welcome", (user, newCount) => {
//   changeRoomTitle(newCount);
//   addMsg(`${user} joined.`);
// });

// socket.on("bye", (user, newCount) => {
//   changeRoomTitle(newCount);
//   addMsg(`${user} left.`);
// });

// socket.on("message", addMsg);

// socket.on("room_change", (rooms) => {
//   const roomList = welcome.querySelector("ul");
//   roomList.innerHTML = "";
//   if (rooms.length === 0) {
//     //방이 삭제됐을때 업데이트
//     return;
//   }
//   rooms.forEach((room) => {
//     const li = document.createElement("li");
//     li.innerText = room;
//     roomList.append(li);
//   });
// });
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
