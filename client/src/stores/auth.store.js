import { defineStore } from "pinia";

// Définition du store auth
const useAuth = defineStore("auth", {
  state: () => ({
    token: null,
    user: null,
    game: null,
    elementGrabbed: null,
  }),
  actions: {
    initData() {
      this.token = localStorage.getItem("token");
      this.user = JSON.parse(localStorage.getItem("user"))
        ? JSON.parse(localStorage.getItem("user"))
        : null;
      this.game = JSON.parse(localStorage.getItem("game"))
        ? JSON.parse(localStorage.getItem("game"))
        : null;
      this.elementGrabbed = null;
    },

    saveSession(token, user, game) {
      localStorage.clear();
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({ id: user.id, name: user.name })
      );
      localStorage.setItem("game", JSON.stringify({ id: game.id }));

      this.token = token;
      this.user = user;
      this.game = game;
    },

    clearSession() {
      localStorage.clear();
    },
  },
});

export default useAuth;
