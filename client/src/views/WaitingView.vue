<script setup>
import { ref } from "vue";
import useApi from "@/stores/api.store";
import socketio from "@/services/socketio";
import useAuth from "@/stores/auth.store";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { watchEffect } from "@vue/runtime-core";

const socket = socketio.socket;
const router = useRouter();

const auth = useAuth();
const { user, game } = storeToRefs(auth);

useApi()
  .get("/games/waiting-room/" + game.value.id)
  .then((res) => {
    auth.game = res.data.game;
  })
  .catch(console.log);

const idCopied = ref(false);

watchEffect(() => {
  console.log(game.value);
  if (game.value && game.value.hasStarted === 1) router.push("/room");
}, [game]);

function lancerSalle() {
  socket.emit("waiting-room/start-game");
}

socket.on("waiting-room/new-user", (data) => {
  if (
    game.value.users.length < 3 &&
    !game.value.users.find((u) => u.id === data.id)
  ) {
    game.value.users.push(data);
  }
});

socket.on("waiting-room/start-game", () => {
  router.push("room");
});

function copyGameIdToClipboard() {
  const dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = game.value.id;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
  setTimeout(() => (idCopied.value = false), 1000);
}
</script>

<template>
  <div
    v-if="user && game.users"
    class="section-container justify-content-between align-items-center p-4"
  >
    <div
      class="d-flex flex-row justify-content-between w-100 align-items-center"
    >
      <div style="flex: 1 1 0">
        <div
          tabindex="0"
          class="m-1 fs-3 game-id"
          :class="{ copied: idCopied }"
          @click="copyGameIdToClipboard"
          @mousedown="idCopied = true"
        >
          {{ game.id }}
          <img
            src="../assets/icons/copy.svg"
            width="25"
            alt="copy"
            class="cursor-pointer"
          />
        </div>
      </div>
      <span class="fs-3"
        >Hi <strong>{{ user.name }}</strong
        >!</span
      >
      <div class="m-1 fs-3 text-end" style="flex: 1 1 0">
        {{ game.users.length }}/3
      </div>
    </div>
    <div class="d-flex flex-row text-center justify-content-center">
      <div class="mb-4 mb-md-0 m-4" v-for="gamer in game.users" :key="gamer.id">
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
            <span>Room {{ gamer.salle }}</span>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="game.users.length === 3"
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
    <div
      v-else
      class="d-flex flex-column justify-content-center align-items-center gap-1"
    >
      <span> Waiting for other players...</span>
      <img
        class="loading-yeti"
        src="../assets/avatar_yeti.png"
        width="40"
        height="40"
        alt="Yeti"
      />
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
.loading-yeti {
  animation: loading-yeti infinite 5s linear;
  position: relative;
}

@keyframes loading-yeti {
  0% {
    transform: scaleX(1) rotate(-5deg); /* Initial direction */
    left: -200px;
  }
  5% {
    transform: scaleX(1) rotate(5deg); /* Slight rotation to the right */
  }
  10% {
    transform: scaleX(1) rotate(-5deg); /* Back to straight position */
  }
  15% {
    transform: scaleX(1) rotate(5deg); /* Slight rotation to the right */
  }
  20% {
    transform: scaleX(1) rotate(-5deg); /* Back to straight position */
  }
  25% {
    transform: scaleX(1) rotate(5deg); /* Slight rotation to the right */
  }
  30% {
    transform: scaleX(1) rotate(-5deg); /* Back to straight position */
  }
  35% {
    transform: scaleX(1) rotate(5deg); /* Slight rotation to the right */
  }
  40% {
    transform: scaleX(1) rotate(-5deg); /* Back to straight position */
  }
  45% {
    transform: scaleX(1) rotate(5deg); /* Slight rotation to the right */
  }
  50% {
    transform: scaleX(-1) rotate(-5deg); /* Flip and slight rotation to the left */
    left: 200px;
  }
  55% {
    transform: scaleX(-1) rotate(5deg); /* Back to straight position */
  }
  60% {
    transform: scaleX(-1) rotate(-5deg); /* Slight rotation to the left */
  }
  65% {
    transform: scaleX(-1) rotate(5deg); /* Back to straight position */
  }
  70% {
    transform: scaleX(-1) rotate(-5deg); /* Slight rotation to the left */
  }
  75% {
    transform: scaleX(-1) rotate(5deg); /* Back to straight position */
  }
  80% {
    transform: scaleX(-1) rotate(-5deg); /* Slight rotation to the left */
  }
  85% {
    transform: scaleX(-1) rotate(5deg); /* Back to straight position */
  }
  90% {
    transform: scaleX(-1) rotate(-5deg); /* Slight rotation to the left */
  }
  95% {
    transform: scaleX(-1) rotate(5deg); /* Back to straight position */
  }
  100% {
    transform: scaleX(1) rotate(-5deg); /* Initial direction */
    left: -200px;
  }
}
</style>
