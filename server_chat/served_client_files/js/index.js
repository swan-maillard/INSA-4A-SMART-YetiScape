const form = document.querySelector("form");
const input = document.querySelector(".input");
const messages = document.querySelector(".messages");
const username = "USER_" + Math.round(Math.random() * 100);
let sessionID = document.querySelector("#sessionID").value
const socket = io();



//Tenporary, delete on integration
document.querySelector("#sessionID").addEventListener("change", () => {
    sessionID = document.querySelector("#sessionID").value
    socket.emit("user_join", { user: username, session_id: sessionID });
})

form.addEventListener("submit", function (event) {
    event.preventDefault();

    addMessage(username + ": " + input.value);

    socket.emit("chat_message", {
        message: input.value,
        session_id: sessionID
    });

    input.value = "";
    return false;
}, false);




socket.on("chat_message", function (data) {
    addMessage(data.username + ": " + data.message);
});

socket.on("user_join", function (data) {
    addMessage(data + " just joined the chat!");
});

socket.on("user_leave", function (data) {
    addMessage(data + " has left the chat.");
});


