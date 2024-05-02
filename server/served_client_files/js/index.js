const form = document.querySelector("form");
const input = document.querySelector(".input");
const messages = document.querySelector(".messages");
const username = "USER_" + Math.round(Math.random() * 100);
let sessionID = document.querySelector("#sessionID").value
const socket = io();

//voice
const userStatus = {
    microphone: true,
    mute: false,
    username: username,
};


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


//voice
navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    let mediaRecorder = new MediaRecorder(stream);
    var audioChunks = [];

    // Start recording
    mediaRecorder.start(100);

    // Event listener for receiving audio data
    mediaRecorder.addEventListener("dataavailable", function (event) {
        audioChunks.push(event.data);
        console.log("manger")
        // Emit the current audio chunk to the server
        if (userStatus.microphone === true) {
            socket.emit("voice", event.data);
        }
    });

    // Log the state of MediaRecorder
    console.log("MediaRecorder state:", mediaRecorder.state);

    // Log an error if the mediaRecorder encounters an error
    mediaRecorder.onerror = function (e) {
        console.error('MediaRecorder Error: ', e);
    };
}).catch((error) => {
    // Log any errors that occur during getUserMedia
    console.error('getUserMedia Error: ', error);
});


socket.on("chat_message", function (data) {
    addMessage(data.username + ": " + data.message);
});

socket.on("user_join", function (data) {
    addMessage(data + " just joined the chat!");
});

socket.on("user_leave", function (data) {
    addMessage(data + " has left the chat.");
});

//voice
socket.emit("userInformation", userStatus);
editButtonClass(document.querySelector("#micBtn"), userStatus.microphone)
editButtonClass(document.querySelector("#deafenBtn"), userStatus.mute)

addMessage("You have joined the chat as '" + username + "'.");
socket.emit("user_join", { user: username, session_id: sessionID });

function addMessage(message) {
    const li = document.createElement("li");
    li.innerHTML = message;
    messages.appendChild(li);
    window.scrollTo(0, document.body.scrollHeight);
}


//voice
// function mainFunction(time) {
//     navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
//         var madiaRecorder = new MediaRecorder(stream);
//         madiaRecorder.start();
//         var audioChunks = [];

//         madiaRecorder.addEventListener("dataavailable", function (event) {
//             audioChunks.push(event.data);
//         });

//         madiaRecorder.addEventListener("stop", function () {
//             var audioBlob = new Blob(audioChunks);
//             audioChunks = [];
//             var fileReader = new FileReader();
//             fileReader.readAsDataURL(audioBlob);
//             fileReader.onloadend = function () {
//                 if (!userStatus.microphone) return;
//                 var base64String = fileReader.result;
//                 socket.emit("voice", base64String);
//             };

//             madiaRecorder.start();
//             setTimeout(function () {
//                 madiaRecorder.stop();
//             }, time);
//         });

//         setTimeout(function () {
//             madiaRecorder.stop();
//         }, time);
//     });

//     socket.on("send", function (data) {
//         var audio = new Audio(data);
//         audio.play();
//     });
// }



//voice
function toggleMute(e) {
    userStatus.mute = !userStatus.mute;
    editButtonClass(e, userStatus.mute);
    emitUserInformation();
}

//voice
function toggleMicrophone(e) {
    userStatus.microphone = !userStatus.microphone;
    editButtonClass(e, userStatus.microphone);
    emitUserInformation();
}

//voice
function editButtonClass(target, bool) {
    const classList = target.classList;
    classList.remove("enable-btn");
    classList.remove("disable-btn");
    if (bool)
        return classList.add("enable-btn");
    classList.add("disable-btn");
}

//voice
function emitUserInformation() {
    socket.emit("userInformation", userStatus);
}
