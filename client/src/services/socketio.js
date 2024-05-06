import { io } from "socket.io-client";

class SocketIo {
  socket;
  constructor() {}

  setupSocketConnection() {
    this.socket = io( "https://" + window.location.hostname +":3000");
  }
}

export default new SocketIo();
