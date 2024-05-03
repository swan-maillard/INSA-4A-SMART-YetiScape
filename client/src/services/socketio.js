import {io} from 'socket.io-client';

class SocketIo {
    socket;
    constructor(){}

    setupSocketConnection(){
        this.socket = io('https://localhost:443')
    }

    join() {
        this.socket.emit('user_join', {user: 'Test', session_id: '1'})
    }

    send_message(message, sessionID) {
        this.socket.emit("chat_message", {
            message: message,
            session_id: sessionID,
        });
    }

    getSocket(){
        return this.socket
    }

    
}

export default new SocketIo()