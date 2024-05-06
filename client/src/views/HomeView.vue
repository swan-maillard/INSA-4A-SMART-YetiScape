<script setup>
import { ref, watch } from "vue";
import router from "../router";
import useAuth from "@/stores/auth.store";
import authStore from "@/stores/auth.store";
import useApi from "@/stores/api.store";

const auth = authStore();
auth.clearSession();

const focus = ref(1);
const sending = ref(false);

const form = ref({
  username: "",
  gameId: "",
});

const inputId = ref();

watch(inputId, () => {
  if (inputId.value) {
    inputId.value.focus();
  }
});

function sendForm() {
  switch (focus.value) {
    case 1:
      sendRequest("/games/create", { username: form.value.username });
      break;
    case 2:
      sendRequest("/games/join", {
        username: form.value.username,
        gameId: form.value.gameId,
      });
      break;
  }
}

const sendRequest = (endpoint, data) => {
  sending.value = true;
  useApi()
    .post(endpoint, data)
    .then(handleResponse)
    .catch((e) => console.log(e.response ? e.response.data.message || e : e))
    .finally(() => (sending.value = false));
};

const handleResponse = (response) => {
  if (response.status !== 200) return;
  useAuth().saveSession(
    response.data.token,
    response.data.user,
    response.data.game
  );
  router.push("/waiting");
};
</script>

<template>
  <div class="section-container justify-content-around">
    <div class="d-flex justify-content-center align-items-center gap-5">
      <div style="width: 80px; height: 80px" />
      <span class="berani" style="font-size: 6em">Yeti Scape</span>
      <img
        src="../assets/avatar_yeti.png"
        width="100"
        height="100"
        alt="Logo"
      />
    </div>

    <form ref="" @submit.prevent="sendForm" class="divForm">
      <input
        v-model="form.username"
        required
        placeholder="Your name"
        autofocus
        style="font-size: 1.3em"
      />
      <div class="optionsContainer d-flex">
        <div
          class="optionBlock"
          :class="{ focus: focus === 1 }"
          @click="focus = 1"
        >
          <span>New game</span>
        </div>

        <div
          class="optionBlock"
          :class="{ focus: focus === 2 }"
          @click="focus = 2"
        >
          <span>Join a game</span>
          <input
            required
            ref="inputId"
            v-if="focus === 2"
            class="dark"
            id="inputId"
            v-model="form.gameId"
            placeholder="Game ID"
          />
        </div>
      </div>
      <div id="confirmation">
        <button>
          Start now !
          <span
            v-if="sending"
            class="button-spinner spinner-border"
            role="status"
          />
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.divForm {
  display: flex;
  align-self: center;
  flex-direction: column;
  align-items: center;
}

.optionsContainer {
  justify-content: space-around;
  width: 100%;
}

.optionBlock {
  height: 10rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
  padding: 20px;
  margin: 50px;
  width: min(50%, 400px);
  box-shadow: none;
  border: 4px solid #ddd;
  cursor: pointer;
  font-size: 1.7em;
  text-align: center;
  font-weight: bold;
  border-radius: 10px;
}

.optionBlock.focus {
  cursor: default;
  border: none;
  background-color: #ddd;
  color: #222;
  box-shadow: 0 0 2px 5px rgba(0, 0, 0, 0.22);
  animation: scale-rotate infinite 1.5s alternate-reverse ease-in-out;
}

@keyframes scale-rotate {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.08) rotate(0.8deg);
  }
}
</style>
