const fs = require('fs');
const https = require('https')
const express = require('express');
const app = express();
const socketio = require('socket.io');
app.use(express.static(__dirname))

const key = fs.readFileSync('./cert/key.pem');
const cert = fs.readFileSync('./cert/cert.pem');

const expressServer = https.createServer({key, cert}, app);
const io = socketio(expressServer,{
    cors: {
        origin: [
            "https://localhost",
            '*' //if using a phone or another computer
        ],
        methods: ["GET", "POST"]
    }
});
expressServer.listen(8181);

// Define a map to store connected sockets per room
const connectedSocketsPerRoom = new Map();

// Define a map to store offers per room
const offersPerRoom = new Map();

// Define a map to store answers per room
const answersPerRoom = new Map();

io.on('connection',(socket)=>{
    const userName = socket.handshake.auth.userName;
    const password = socket.handshake.auth.password;
    const room = socket.handshake.query.room; // Get the room ID from the handshake query

    // Check if the room has reached its limit of 3 sockets
    if (!connectedSocketsPerRoom.has(room)) {
        connectedSocketsPerRoom.set(room, []);
    }

    const socketsInRoom = connectedSocketsPerRoom.get(room);
    if (socketsInRoom.length >= 3) {
        socket.disconnect(true); // Disconnect the socket if the room is full
        return;
    }

    if (password !== "x") {
        socket.disconnect(true);
        return;
    }

    // Store the socket in the connectedSocketsPerRoom map
    connectedSocketsPerRoom.get(room).push(socket);

    // Join the room
    socket.join(room);

    // Emit available offers if any
    if(offersPerRoom.has(room)){
        socket.emit('availableOffers', offersPerRoom.get(room));
    }
    
    // Handle new offer
    socket.on('newOffer', (newOffer) => {
        // Store the offer in the offersPerRoom map
        if (!offersPerRoom.has(room)) {
            offersPerRoom.set(room, []);
        }
        offersPerRoom.get(room).push(newOffer);

        // Broadcast the new offer to all sockets in the room except the sender
        socket.to(room).emit('newOfferAwaiting', newOffer);
    });

    // Handle new answer
    socket.on('newAnswer', (answerObj, ackFunction) => {
        // Store the answer in the answersPerRoom map
        if (!answersPerRoom.has(room)) {
            answersPerRoom.set(room, []);
        }
        answersPerRoom.get(room).push(answerObj);

        // Emit the answer back to the offerer
        const offererSocket = connectedSocketsPerRoom.get(room).find(s => s.userName === answerObj.offererUserName);
        if (offererSocket) {
            offererSocket.emit('answerResponse', answerObj);
        }
        
        // Send back all the ice candidates we have already collected
        const offerToUpdate = offersPerRoom.get(room).find(o => o.offererUserName === answerObj.offererUserName);
        if (offerToUpdate) {
            ackFunction(offerToUpdate.offerIceCandidates);
        }
    });

    // Handle ice candidates
    socket.on('sendIceCandidateToSignalingServer', iceCandidateObj => {
        const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;

        if (didIOffer) {
            // Ice is coming from the offerer. Send to the answerer
            const offerInOffers = offersPerRoom.get(room).find(o => o.offererUserName === iceUserName);
            if (offerInOffers) {
                offerInOffers.offerIceCandidates.push(iceCandidate);
                const answererSocket = connectedSocketsPerRoom.get(room).find(s => s.userName === offerInOffers.answererUserName);
                if (answererSocket) {
                    answererSocket.emit('receivedIceCandidateFromServer', iceCandidate);
                }
            }
        } else {
            // Ice is coming from the answerer. Send to the offerer
            const answerInAnswers = answersPerRoom.get(room).find(a => a.answererUserName === iceUserName);
            if (answerInAnswers) {
                answerInAnswers.answererIceCandidates.push(iceCandidate);
                const offererSocket = connectedSocketsPerRoom.get(room).find(s => s.userName === answerInAnswers.offererUserName);
                if (offererSocket) {
                    offererSocket.emit('receivedIceCandidateFromServer', iceCandidate);
                }
            }
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        // Remove the socket from the room's connected sockets list
        const index = connectedSocketsPerRoom.get(room).indexOf(socket);
        if (index !== -1) {
            connectedSocketsPerRoom.get(room).splice(index, 1);
        }
    });
});
