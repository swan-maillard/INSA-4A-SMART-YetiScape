import { defineStore } from "pinia";

// Définition du store auth
const useAuth = defineStore("auth", {
  state: () => ({
    token: null,
    username: null,
    gameId: null,
  }),
  actions: {
    initData() {
      this.token = localStorage.getItem("token");
      this.username = localStorage.getItem("username");
      this.gameId = localStorage.getItem("gameId");
    },

    saveSession(token, username, gameId) {
      localStorage.clear();
      localStorage.setItem("username", username);
      localStorage.setItem("token", token);
      localStorage.setItem("gameId", gameId);
      this.initData();
    },

    clearSession() {
      localStorage.clear();
      this.initData();
    },
  },
});

export default useAuth;
