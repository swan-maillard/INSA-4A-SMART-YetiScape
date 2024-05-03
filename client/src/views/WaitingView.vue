<template>
  <div class="m-3">
    <div class="d-flex flex-row justify-content-between">
      <p class="m-1">id de la partie : {{ gameId }}</p>
      <p class="m-1">{{ gamerId }}/3</p>
    </div>

    <div class="d-flex flex-row text-center justify-content-center">
      <div class="mb-4 mb-md-0 m-4" v-for="gamer in gamers" :key="gamer.id">
        <div class="card testimonial-card">
          <div class="card-up"></div>
          <div class="avatar mx-auto bg-white">
            <img
              src="../assets/avatar_yeti.png"
              class="rounded-circle img-fluid"
            />
          </div>
          <div class="card-body">
            <h4 class="mb-4">{{ gamer.name }}</h4>
            <hr />
            <p class="dark-grey-text mt-4">
              <i class="fas fa-quote-left pe-2"></i>Un nouveau participant
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="gamerId == 3" class="flex justify-content-end mt-4">
      <button
        type="button"
        class="btn btn-primary"
        data-toggle="button"
        aria-pressed="false"
        autocomplete="off"
        @click="lancerSalle"
      >
        Démarrer la partie
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

let gameId = 0;
let gamerId = 0;
let callId = "";
let token = localStorage.getItem("token");

//variables for voice call
// Handle prefixed versions
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

// State
var me = {};
var myStream;
var peers = {};

const gamers = ref([]);

const config = {
  headers: {
    "Content-Type": "application/json", // Content-Type header
    Authorization: `Bearer ${token}`, // JWT token in the Authorization header
    "Access-Control-Allow-Origin": "*", // CORS header to allow requests from any origin
  },
};
infosGame();
setInterval(infosGame, 1000);
initVoiceChat() 

function infosGame() {
  axios
    .get("https://localhost:3000/game", config)
    .then((response) => respGame(response))
    .catch(console.log);
}

function respGame(response) {
  if (response.status == 200) {
    gameId = response.data.id;
    callId = response.data.callId;
    if (response.data.users.length > gamerId && gamerId < 4) {
      for (let i = gamerId; i < response.data.users.length; i++) {
        gamers.value.push({ id: gamerId++, name: response.data.users[i].name });
      }
    }
  }
}

function lancerSalle() {
  let userName = localStorage.getItem("nom");
  if (userName == gamers.value[0].name) {
    console.log("Salle 1");
  } else if (userName == gamers.value[1].name) {
    console.log("Salle 2");
  } else {
    console.log("Salle 3");
  }
}

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
        $.get("https://localhost:3000/chat/" + callId + ".json").then((call) => {
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
    $.post("https://localhost:3000/chat/" + callId + "/addpeer/" + me.id);
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
    $.get("https://localhost:3000/chat/" + callId + ".json").then((call) => {
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
</script>

<style>
.card {
  width: 15rem;
}

.testimonial-card .card-up {
  height: 90px;
  overflow: hidden;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}

.card-up {
  background: #667eea;

  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-linear-gradient(
    to top,
    rgba(97, 154, 239, 0.5),
    rgba(94, 113, 145, 0.5)
  );

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(
    to top,
    rgba(97, 154, 239, 0.5),
    rgba(94, 113, 145, 0.5)
  );
}

.testimonial-card .avatar {
  width: 110px;
  margin-top: -60px;
  overflow: hidden;
  border: 3px solid #fff;
  border-radius: 50%;
}

.testimonial-card .card-up {
  height: 120px;
  overflow: hidden;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}

.testimonial-card .avatar {
  width: 110px;
  margin-top: -60px;
  overflow: hidden;
  border: 3px solid #fff;
  border-radius: 50%;
}
</style>
