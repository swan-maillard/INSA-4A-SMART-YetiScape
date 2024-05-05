<script setup>
import { computed, ref } from "vue";
import apiStore from "@/stores/api.store";
import socketio from "@/services/socketio";
import useAuth from "@/stores/auth.store";
import { useRouter } from "vue-router";

const { username } = useAuth();

const socket = socketio.socket;

const router = useRouter();

const idCopied = ref(false);

let gameId = "ID DE LA ROOM";
const gamers = ref([]);
const nbGamers = computed(() => gamers.value.length);

infosGame();

function infosGame() {
  apiStore()
    .get("/game")
    .then((response) => {
      if (response.status !== 200) return;

      gameId = response.data.id;
      gamers.value = response.data.users;
    })
    .catch(console.log);
}

function lancerSalle() {
  socket.emit("waiting-room/start-game");
}

socket.on("waiting-room/new-user", (data) => {
  gamers.value.push(data);
});
socket.on("waiting-room/start-game", () => {
  router.push("room1");
});

function copyGameIdToClipboard() {
  const dummy = document.createElement("textarea");
  // to avoid breaking orgain page when copying more words
  // cant copy when adding below this code
  // dummy.style.display = 'none'
  document.body.appendChild(dummy);
  //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
  dummy.value = gameId;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
  setTimeout(() => (idCopied.value = false), 1000);
}
</script>

<template>
  <div
    class="m-3 d-flex flex-column justify-content-between align-items-center w-100 flex-grow-1"
  >
    <div class="d-flex flex-row justify-content-between w-100">
      <div style="flex: 1 1 0">
        <div
          tabindex="0"
          class="m-1 fs-3 game-id"
          :class="{ copied: idCopied }"
          @click="copyGameIdToClipboard"
          @mousedown="idCopied = true"
        >
          {{ gameId }}
          <img
            src="../assets/icons/copy.svg"
            width="25"
            alt="copy"
            class="cursor-pointer"
          />
        </div>
      </div>

      <span class="fs-3 text-center" style="flex: 1 1 0">
        Welcome, <strong>{{ username }}</strong>
      </span>
      <div class="m-1 fs-3 text-end" style="flex: 1 1 0">{{ nbGamers }}/3</div>
    </div>
    <div class="d-flex flex-row text-center justify-content-center">
      <div class="mb-4 mb-md-0 m-4" v-for="gamer in gamers" :key="gamer.id">
        <div class="card testimonial-card">
          <div class="card-up"></div>
          <div class="avatar mx-auto bg-white">
            <img
              :src="
                'https://source.boringavatars.com/beam/50/' +
                gamer.name +
                '?colors=DDDDDD,222222'
              "
              class="rounded-circle img-fluid"
              alt="Avatar"
              width="110"
              height="110"
            />
          </div>
          <div class="card-body">
            <h4 class="mb-4">{{ gamer.name }}</h4>
            <hr />
            <p>Salle {{ gamer.salle }}</p>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="nbGamers === 3"
      class="d-flex justify-content-center align-items-center w-100 mt-4"
    >
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

<style>
.game-id {
  background-color: #ddd;
  color: #222;
  padding: 5px 20px;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  transition: 0.3s;
  cursor: pointer;
  width: fit-content;
}

.game-id.copied {
  background-color: #45933e;
}

.game-id:focus {
  transform: scale(0.9);
}

.card {
  width: 15rem;
  border: none !important;
  background-color: #ddd !important;
  box-shadow: 0 0 10px 5px #0000004f;
}

.testimonial-card .card-up {
  height: 90px;
  overflow: hidden;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}

.card-up {
  background: #222;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.83),
    rgba(15, 15, 15, 0.61)
  );
}

.testimonial-card .avatar {
  width: 110px;
  margin-top: -60px;
  overflow: hidden;
  border: 3px solid #ddd;
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
  border: 3px solid #ddd;
  border-radius: 50%;
}
</style>
