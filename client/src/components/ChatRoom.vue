<script setup>
import { ref, onMounted } from "vue";
import socketio from "@/services/socketio";
import useAuth from "@/stores/auth.store";
import { watchEffect } from "@vue/runtime-core";

const auth = useAuth();
let callId = auth.game.callId;

const messages = ref([]);
const newMessage = ref("");
const collapsed = ref(false);
var isMuted = false; // New variable to track mute state
var audioTrack; // Variable to store audio track

//Voice setup
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

// State
var me = {};
var myStream;
var peers = {};

initVoiceChat();

function initVoiceChat() {
  init();

  // Start everything up
  function init() {
    if (!navigator.getUserMedia) return unsupported();

    getLocalAudioStream(function (err, stream) {
      if (err || !stream) return;

      connectToPeerJS(function (err) {
        if (err) return;

        registerIdWithServer(me.id);
        // eslint-disable-next-line
        $.get(
          "https://" +
            window.location.hostname +
            ":3000/chat/" +
            callId +
            ".json"
        ).then((call) => {
          if (call.peers.length) callPeers();
        });
      });
    });
  }

  // Connect to PeerJS and get an ID
  function connectToPeerJS(cb) {
    display("Connecting to PeerJS...");
    // eslint-disable-next-line
    me = new Peer({ host: "/", secure: true, port: 3000, path: "/peer" });

    me.on("call", handleIncomingCall); // Quand on recoit un call

    me.on("open", function () {
      display("Connected.");
      display("ID: " + me.id);
      cb && cb(null, me);
    });

    me.on("error", function (err) {
      display(err);
      cb && cb(err);
    });
  }

  // Add our ID to the list of PeerJS IDs for this call
  function registerIdWithServer() {
    display("Registering ID with server...");
    // eslint-disable-next-line
    $.post(
      "https://" +
        window.location.hostname +
        ":3000/chat/" +
        callId +
        "/addpeer/" +
        me.id
    );
  }

  /*

  // Remove our ID from the call's list of IDs
  function unregisterIdWithServer() {
    // eslint-disable-next-line
    $.post("/" + callId + "/removepeer/" + me.id);
  }
  */

  // Call each of the peer IDs using PeerJS
  function callPeers() {
    // Permet de call TOUS les peers du call
    // eslint-disable-next-line
    $.get(
      "https://" + window.location.hostname + ":3000/chat/" + callId + ".json"
    ).then((call) => {
      call.peers.forEach(callPeer);
    });
  }

  function callPeer(peerId) {
    // Petmet de call UN peer du call
    display("Calling " + peerId + "...");
    var peer = getPeer(peerId);
    peer.outgoing = me.call(peerId, myStream);

    peer.outgoing.on("error", function (err) {
      display(err);
    });

    peer.outgoing.on("stream", function (stream) {
      display("Connected to " + peerId + ".");
      addIncomingStream(peer, stream);
    });
  }

  // When someone initiates a call via PeerJS
  function handleIncomingCall(incoming) {
    display("Answering incoming call from " + incoming.peer);
    var peer = getPeer(incoming.peer);
    peer.incoming = incoming;
    incoming.answer(myStream);
    peer.incoming.on("stream", function (stream) {
      addIncomingStream(peer, stream);
    });
  }

  // Add the new audio stream. Either from an incoming call, or
  // from the response to one of our outgoing calls
  function addIncomingStream(peer, stream) {
    display("Adding incoming stream from " + peer.id);
    peer.incomingStream = stream;
    playStream(stream);
  }

  // Create an <audio> element to play the audio stream
  function playStream(stream) {
    // eslint-disable-next-line
    var audio = $("<audio autoplay />").appendTo("body");
    audio[0].srcObject = stream;
  }

  // Get access to the microphone
  function getLocalAudioStream(cb) {
    display('Trying to access your microphone. Please click "Allow".');

    navigator.getUserMedia(
      { video: false, audio: true },

      function success(audioStream) {
        display("Microphone is open.");
        myStream = audioStream;
        audioTrack = myStream.getAudioTracks()[0]; // Store audio track reference

        if (cb) cb(null, myStream);
      },

      function error(err) {
        display(
          "Couldn't connect to microphone. Reload the page to try again."
        );
        if (cb) cb(err);
      }
    );
  }

  ////////////////////////////////////
  // Helper functions
  function getPeer(peerId) {
    return peers[peerId] || (peers[peerId] = { id: peerId });
  }

  function unsupported() {
    display("Your browser doesn't support getUserMedia.");
  }

  function display(message) {
    console.log(message);
  }
}


 // Function to toggle mute state
 // eslint-disable-next-line
function toggleMute() {
    isMuted = !isMuted; // Toggle mute state
    audioTrack.enabled = !isMuted; // Enable/disable audio track
    if (isMuted)
    {
      document.getElementById("muteButton").innerHTML = "Unmute"
    }
    else
    {
      document.getElementById("muteButton").innerHTML = "Mute"
    }
  }


onMounted(() => {
  document.getElementById("muteButton").addEventListener("click", toggleMute);
})


//End of voice setup

const socket = socketio.socket;

// Method to send a message
const sendMessage = () => {
  if (newMessage.value.trim() !== "") {
    socket.emit("chat/message", { message: newMessage.value });
    newMessage.value = "";
  }
};

// Function to scroll to bottom of messages container
const scrollToBottom = () => {
  const messagesContainer =
    document.getElementsByClassName("messages-container");
  if (messagesContainer.length > 0) {
    messagesContainer[0].scrollTop = messagesContainer[0].scrollHeight;
  }
};

socket.on("chat/message", function (data) {
  messages.value.push({ username: data.username, text: data.message });
  setTimeout(scrollToBottom, 1);
});

watchEffect(() => {
  if (auth.game.users) {
    const usersNames = auth.game.users
      .map((u) => u.name)
      .filter((u) => u !== auth.user.name);
    messages.value.push({
      text: "You can talk with " + usersNames.join(" and ") + ".",
    });
  }
}, [auth.game]);

scrollToBottom();
</script>

<template>
  <div class="section-container chat-box" :class="{ collapsed }">
    <div class="w-100 d-flex flex-column align-items-center flex-grow-1">
      <div
        class="d-flex justify-content-between w-100 cursor-pointer"
        @click="collapsed = !collapsed"
      >
        <span></span>
        <span class="fs-5 ms-4">Chatbox</span>
        <span
          class="fs-4 me-4 d-flex align-items-center"
          style="transition: 0.5s"
          :style="!collapsed ? 'transform: rotate(180deg)' : ''"
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <polyline
              fill="none"
              points="3,15.5 12,6.5 21,15.5 "
              stroke="currentColor"
              stroke-miterlimit="10"
              stroke-width="2"
            />
          </svg>
        </span>
      </div>
      <hr />
      <div class="messages-container">
        <div v-for="(message, index) in messages" :key="index">
          <span
            class="username"
            :class="{ self: message.username === auth.user.name }"
            v-if="message.username"
          >
            {{ message.username }}:
          </span>
          <span class="message" :class="{ info: !message.username }">
            {{ message.text }}
          </span>
        </div>
      </div>
    </div>

    <input
      v-model="newMessage"
      @keyup.enter="sendMessage"
      placeholder="Type your message..."
    />
     <button id="muteButton">Mute</button>
  </div>
</template>

<style scoped>
.chat-box {
  width: 250px;
  max-width: 250px;
  min-width: 250px;
  font-size: 0.7em;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 320px;
  overflow: hidden;
  transition: 0.5s;
}

.chat-box.collapsed {
  max-height: 55px;
}

.chat-box.collapsed hr {
  opacity: 0;
}

.chat-box input {
  font-size: 1.2em !important;
  width: 100%;
  border-radius: 15px !important;
  border: 1px solid #ddd;
  background-color: rgba(51, 51, 51, 0.48);
}

.messages-container {
  padding: 10px;
  background-color: rgba(51, 51, 51, 0.48);
  display: flex;
  flex-direction: column;
  gap: 1px;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  word-break: break-word;
  width: 100%;
  border-radius: 20px;
  flex-grow: 1;
}

.message {
  font-weight: bold;
}

.message.info {
  font-weight: normal;
  color: #ffd90d;
}

.username {
  color: #02acff;
  font-weight: normal;
}

.self {
  color: #f83636;
}

hr {
  opacity: 0.25;
  color: #ddd;
  width: 90%;
  margin: 0;
  margin-bottom: 10px;
}
</style>
