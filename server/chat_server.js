import { Server } from 'socket.io';
import express from 'express';
import { createServer } from 'http';

const app = express(); 
const http = createServer(app);
const io = new Server(http);

const sessionsMap = {};

app.use(express.static("served_client_files"))
// app.get("/", function(req, res) {
//     res.sendFile(process.cwd() + "/served_client_files/chat_client.html");
// });


io.on("connection", function(socket) {

    socket.on("user_join", function(data) {
        this.username = data.user;
        sessionsMap[socket.id] = data.session_id
        for (const [socketId, sessionId] of Object.entries(sessionsMap)) {
            if (sessionId == data.session_id)
            {
                socket.broadcast.to(socketId).emit("user_join",  data.user);
            }
        }
    });

    socket.on("chat_message", function(data) {
        data.username = this.username;
        for (const [socketId, sessionId] of Object.entries(sessionsMap)) {
            if (sessionId == data.session_id)
            {
                socket.broadcast.to(socketId).emit("chat_message",  data);
            }
        }
    });

    socket.on("disconnect", function(data) {
        const disconnectedSession = sessionsMap[socket.id]
        delete sessionsMap[socket.id]        
        for (const [socketId, sessionId] of Object.entries(sessionsMap)) {
            if (sessionId == disconnectedSession)
            {
                socket.broadcast.to(socketId).emit("user_leave", this.username);
            }
        }
    });
});



http.listen(3000, '0.0.0.0',function() {
    console.log("Listening on port " + 3000);
});


