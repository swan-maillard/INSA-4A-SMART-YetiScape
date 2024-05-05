<script setup>
import { ref } from "vue";
import router from "../router";
import useAuth from "@/stores/auth.store";
import authStore from "@/stores/auth.store";
import useApi from "@/stores/api.store";

const focus = ref(1);
const sending = ref(false);

authStore().clearSession();

const form = ref({
  username: "",
  gameId: "",
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
  <div class="d-flex justify-content-center align-items-center gap-5">
    <div style="width: 80px; height: 80px" />
    <span class="berani" style="font-size: 4em">Yeti Scape</span>
    <img src="../assets/avatar_yeti.png" width="80" height="80" alt="Logo" />
  </div>
  <form ref="" @submit.prevent="sendForm" class="divForm">
    <input
      v-model="form.username"
      required
      placeholder="Votre nom"
      style="font-size: 1.3em"
    />
    <div class="optionsContainer d-flex">
      <div
        class="optionBlock"
        :class="{ focus: focus === 1 }"
        @click="focus = 1"
      >
        <span>Créer une partie</span>
      </div>

      <div
        class="optionBlock"
        :class="{ focus: focus === 2 }"
        @click="focus = 2"
      >
        <span>Rejoindre une partie</span>
        <input
          v-if="focus === 2"
          class="dark"
          id="inputId"
          v-model="form.gameId"
          placeholder="ID de la partie"
          @click="(evt) => evt.currentTarget.parentElement.click()"
        />
      </div>
    </div>
    <div id="confirmation">
      <button>
        Lancer la partie
        <span
          v-if="sending"
          class="button-spinner spinner-border"
          role="status"
        />
      </button>
    </div>
  </form>
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
  animation: scale-rotate infinite 2s alternate-reverse ease-in-out;
}

@keyframes scale-rotate {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05) rotate(0.5deg);
  }
}
</style>
