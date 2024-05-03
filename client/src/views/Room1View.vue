<template>
  <div id="GameScreen" class="d-flex flex-raw">
    <div id="inventaire" class="d-flex flex-col">
      <table class="table table-striped table-dark">
        <thead class="height">
          <tr>
            <th scope="col">Inventaire du joueur</th>
          </tr>
        </thead>
        <tbody id="ajoutInventaire"></tbody>
      </table>
    </div>
    <div id="conteneur_chat">
      <div>
        <ul id="messages"></ul>
      </div>
      <div>
        <form id="message_submit_form">
          <input
            type="text"
            id="input_message"
            class="input"
            autocomplete="off"
            autofocus
          />
          <button class="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
    <div id="jeu">
      <canvas id="GameCanva" ref="bjsCanvas" />
    </div>
  </div>
</template>

<script>
/* eslint-disable */

// var urlLink = URL.createObjectURL('../assets/gears.obj');
// console.log(urlLink);
import { ref, onMounted } from "@vue/runtime-core";
import { createScene } from "../scenes/room1";
import socketio from "@/services/socketio";

const ajoutInventaire = ref(null);
function verif(x) {
  console.log("LOG:" + x);
  if (x === "engrenageMoyen") {
    var imgEngrenage = document.createElement("img");
    imgEngrenage.src = "/img/engrenageMoyen.png";
    imgEngrenage.style.width = "100%";

    var newTh = document.createElement("th");
    newTh.id = "engrenage";
    newTh.scope = "row";
    newTh.appendChild(imgEngrenage);

    var newTr = document.createElement("tr");
    newTr.appendChild(newTh);

    document.getElementById("ajoutInventaire").appendChild(newTr);

    return true;
  } else {
    return false;
  }
}

export default {
  name: "BabylonScene",
  setup() {
    const bjsCanvas = ref(null);

    onMounted(() => {
      if (bjsCanvas.value) {
        createScene(bjsCanvas.value, verif);
      }
      initChat();
    });

    return {
      bjsCanvas,
    };
  },
};

//text chat code
function initChat() {
  const form = document.querySelector("#message_submit_form");
  const input = document.querySelector("#input_message");
  const messages = document.querySelector("#messages");

  //Get the username
  const username = "USER_" + Math.round(Math.random() * 100);
  //Get the sessionID
  let sessionID = 0;
  //Get the socket imported above
  const socket = socketio;
  console.log(socket);
  form.addEventListener(
    "submit",
    function (event) {
      event.preventDefault();

      addMessage(username + ": " + input.value);

      socket.send_message(input.value, sessionID);

      input.value = "";
      return false;
    },
    false
  );

  socket.socket.on("chat_message", function (data) {
    addMessage(data.username + ": " + data.message);
  });

  socket.socket.on("user_join", function (data) {
    addMessage(data + " just joined the chat!");
  });

  socket.socket.on("user_leave", function (data) {
    addMessage(data + " has left the chat.");
  });

  addMessage("You have joined the chat as '" + username + "'.");
  socket.join(username, sessionID);

  function addMessage(message) {
    const li = document.createElement("li");
    li.innerHTML = message;
    messages.appendChild(li);
    window.scrollTo(0, document.body.scrollHeight);
  }
}
</script>

<style scoped>
#GameCanva {
  height: 100%;
  width: 100%;
}
#GameScreen {
  width: 100%;
  height: 100%;
}
#inventaire {
  width: 10%;
  height: 100%;
}
#jeu {
  width: 90%;
  height: 100%;
}
img {
  width: 100%;
  height: 100%;
}
</style>
