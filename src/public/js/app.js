const socket = new WebSocket(`ws://${window.location.host}`); //socket=서버로의 연결

socket.addEventListener("open", () => {
  console.log("Connected to Server ✔"); //connect to server
});

socket.addEventListener("message", (message) => {
  console.log("New message: ", message.data, " from the server"); //server => browser
});

socket.addEventListener("close", () => {
  console.log("Disconnected to Server ❌"); //disconnect to server
});

setTimeout(() => {
  socket.send("hello from the browser!"); //browser => server
}, 10000);
