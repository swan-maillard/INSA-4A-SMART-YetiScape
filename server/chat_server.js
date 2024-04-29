import { Server } from 'socket.io';
import express from 'express';
import { createServer } from 'http';

const app = express(); 
const http_r = createServer();
const io = new Server(http_r);
const port = process.env.PORT || 3000;

io.on("connection", function(socket) {

    socket.on("user_join", function(data) {
        this.username = data;
        socket.broadcast.emit("user_join", data);
    });

    socket.on("chat_message", function(data) {
        data.username = this.username;
        socket.broadcast.emit("chat_message", data);
    });

    socket.on("disconnect", function(data) {
        socket.broadcast.emit("user_leave", this.username);
    });
});

app.get("/", function(req, res) {
    res.sendFile(process.cwd() + "/served_client_files/chat_client.html");
});

http_r.listen(port, function() {
    console.log("Listening on port " + port);
});