import {io} from 'socket.io-client';

class SocketIo {
    socket;
    constructor(){}

    setupSocketConnection(){
        this.socket = io('http://localhost:3000')
    }

    join() {
        this.socket.emit('user_join', {user: 'Test', session_id: '1'})
    }

    
}

export default new SocketIo()