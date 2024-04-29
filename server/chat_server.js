import express from "express";
import * as http from 'http';

const app = express();

const http_r = http.Server(app);
const port = process.env.PORT || 3000;

app.get("/", function(req, res) {
    res.sendFile(process.cwd() + "/served_client_files/chat_client.html");
});

http_r.listen(port, function() {
    console.log("Listening on port " + port);
});