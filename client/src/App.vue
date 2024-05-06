<script setup>
import ChatRoom from "@/components/ChatRoom.vue";
import useAuth from "@/stores/auth.store";
import { watchEffect } from "vue";
import socketio from "@/services/socketio";
import { storeToRefs } from "pinia";
import { ref } from "@vue/runtime-core";
import UserInventaire from "@/components/UserInventaire.vue";

const auth = useAuth();
auth.initData();

const { user, game } = storeToRefs(auth);

const joinedSocket = ref(false);
const ambiantSound = ref();

watchEffect(() => {
  if (ambiantSound.value) {
    ambiantSound.value.volume = 0.1;
  }
}, [ambiantSound]);

watchEffect(() => {
  if (user.value && !joinedSocket.value) {
    joinedSocket.value = true;
    socketio.socket.emit("join-game", { username: user.value.name });
  } else if (!user.value) {
    joinedSocket.value = false;
  }
}, [user.value]);
</script>

<template>
  <div class="noise snow-wrap">
    <div class="snow"></div>
  </div>
  <div class="main-container">
    <div
      v-if="game"
      class="d-flex flex-column justify-content-end"
      style="gap: 30px"
    >
      <UserInventaire v-if="game && game.hasStarted" />
      <ChatRoom v-if="game" />
    </div>
    <RouterView />
  </div>
  <audio loop autoplay ref="ambiantSound">
    <source src="./assets/ambiant-sound.mp3" type="audio/mpeg" />
  </audio>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&display=swap");

@font-face {
  font-family: "Berani";
  src: url("assets/fonts/Berani/Berani.otf") format("opentype");
}

body,
html,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
  background-color: #ddd;
  //background-image: url("https://www.textures.com/system/gallery/photos/Ground/Snow/120168/Snow0158_9_350.jpg");
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  background-size: 7%;
  font-family: "Josefin Sans", sans-serif;
}

.cursor-pointer {
  cursor: pointer;
}

.noise {
  width: 100%;
  height: 100%;
  position: absolute;
  background-image: url("assets/noisy.png");
  opacity: 0.3;
  background-size: 25%;
  pointer-events: none;
  z-index: 100;
}

.main-container {
  width: 100%;
  height: 100%;
  color: #ddd;
  padding: 60px;
  display: flex;
  gap: 40px;
}

.section-container {
  border-radius: 20px;
  flex-grow: 1;
  height: 100%;
  box-shadow: 0 0 9px 1px #000000a6;
  background-color: #151515;
  padding: 15px;
  transition: 1s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.berani {
  font-family: "Berani", sans-serif;
}

button,
input,
optgroup,
select,
textarea {
  border-radius: 30px;
  padding: 5px 10px;
  text-align: center;
  border: 2px solid #ddd;
  color: #ddd;
  font-size: 1.2rem !important;
  background-color: rgba(51, 51, 51, 0.92);
}
button.dark,
input.dark,
optgroup.dark,
select.dark,
textarea.dark {
  border: 2px solid #222;
  color: #222;
  background-color: #00000038;
}

[type="button"],
[type="reset"],
[type="submit"],
button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer !important;
  border-radius: 30px !important;
  padding: 10px 20px !important;
  color: #222 !important;
  background-color: #ddd !important;
  transition: 0.5s;
  border: none !important;
}

[type="button"]:hover,
[type="reset"]:hover,
[type="submit"]:hover,
button:hover {
  background-color: #b0b0b0 !important;
  transform: scale(1.05);
}

.button-spinner {
  width: 1.5em !important;
  height: 1.5em !important;
}

.snow,
.snow:after,
.snow::before {
  content: "";
  position: absolute;
  top: -650px;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: radial-gradient(4px 4px at 100px 50px, #fff, transparent),
    radial-gradient(6px 6px at 200px 150px, #fff, transparent),
    radial-gradient(3px 3px at 300px 250px, #fff, transparent),
    radial-gradient(4px 4px at 400px 350px, #fff, transparent),
    radial-gradient(6px 6px at 500px 100px, #fff, transparent),
    radial-gradient(3px 3px at 50px 200px, #fff, transparent),
    radial-gradient(4px 4px at 150px 300px, #fff, transparent),
    radial-gradient(6px 6px at 250px 400px, #fff, transparent),
    radial-gradient(3px 3px at 350px 500px, #fff, transparent),
    radial-gradient(4px 4px at 550px 550px, #fff, transparent);
  background-size: 650px 650px;
  animation: SnowAnim 5s linear infinite;
}
.snow:after {
  margin-left: -250px;
  opacity: 0.5;
  filter: blur(2px);
  animation-direction: reverse;
  animation-duration: 6s;
}
.snow::before {
  margin-left: -350px;
  opacity: 0.7;
  filter: blur(1px);
  animation-direction: reverse;
  animation-duration: 9s;
}
@keyframes SnowAnim {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(650px);
  }
}
</style>
