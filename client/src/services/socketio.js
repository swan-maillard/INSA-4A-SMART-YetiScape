import { io } from "socket.io-client";

class SocketIo {
  socket;
  constructor() {}

  setupSocketConnection() {
    this.socket = io("https://localhost:3000");
  }

  join(username, sessionID) {
    this.socket.emit("user_join", { user: username, session_id: sessionID });
  }

  send_message(message, sessionID) {
    console.log("sending message");
    this.socket.emit("chat_message", {
      message: message,
      session_id: sessionID,
    });
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketIo();
