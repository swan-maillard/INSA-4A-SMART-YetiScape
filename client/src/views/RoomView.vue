<script setup>
/* eslint-disable */
import { computed, ref, watchEffect } from "@vue/runtime-core";
import * as room1 from "../scenes/room1";
import * as room2 from "../scenes/room2";
import * as room3 from "../scenes/room3";
import useAuth from "../stores/auth.store";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import useApi from "@/stores/api.store";

const router = useRouter();

const auth = useAuth();
const { user, game, elementGrabbed } = storeToRefs(auth);
const gameLoaded = ref(false);

useApi()
  .get("/game/salle")
  .then((res) => {
    auth.user = res.data.user;
    auth.game = res.data.game;
  })
  .catch(console.log)
  .finally(() => (gameLoaded.value = true));

watchEffect(() => {
  // TODO : uncomment that
  if (gameLoaded.value && !game.value.hasStarted) router.push("/waiting");
}, [game]);

const bjsCanvas = ref(null);
const canvaMounted = ref(false);
const inventaire = computed(() => user.value.items || []);
const dragElement = ref(null);
const popup = ref();
let scene;

const room = ref();
watchEffect(() => {
  if (
    room.value ||
    !gameLoaded.value ||
    !user.value.salle ||
    !game.value.hasStarted
  )
    return;

  switch (user.value.salle) {
    case 1:
      room.value = room1;
      break;
    case 2:
      room.value = room2;
      break;
    case 3:
      room.value = room3;
      break;
  }
}, [user]);

const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    const cr = entry.contentRect;
    entry.target.width = cr.width;
    entry.target.height = cr.height;
  }
});

watchEffect(() => {
  if (!canvaMounted.value && bjsCanvas.value && room.value) {
    canvaMounted.value = true;
    scene = room.value.createScene(bjsCanvas.value);
    resizeObserver.observe(bjsCanvas.value);
  }
}, [bjsCanvas, room]);

function imgDrop() {
  if (elementGrabbed.value && room.value) {
    room.value.verif(scene, elementGrabbed.value.id);
    elementGrabbed.value = null;
  } else {
    console.log("Aucun élément sélectionné");
  }
}

watchEffect(() => {
  if (popup.value) {
    document.addEventListener("mousemove", (e) => {
      popup.value.top = e.clientY + "px";
      popup.value.left = e.clientX + "px";
    });
  }
}, [popup]);
</script>

<template>
  <div v-if="gameLoaded && room" id="GameScreen" class="d-flex flex-raw">
    <div id="jeu" @drop="imgDrop" @dragover.prevent>
      <div class="popup" ref="popup">Salut la compagnie</div>
      <canvas id="GameCanva" ref="bjsCanvas" />
    </div>
  </div>
</template>

<style scoped>
#GameCanva {
  height: 100%;
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 0 9px 1px #000000a6;
}
#GameScreen {
  width: 100%;
  height: 100%;
}
#jeu {
  width: 90%;
  height: 100%;
  position: relative;
}

.popup {
  background-color: #222;
  position: absolute;
  padding: 30px;
  border-radius: 20px;
  border: 2px solid #ddd;
  box-shadow: 0 0 9px 1px #000000a6;
}

img {
  width: 100%;
  height: 100%;
}
</style>
