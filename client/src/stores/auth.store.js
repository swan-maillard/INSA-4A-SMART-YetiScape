import { defineStore } from "pinia";
import useApi from "./api.store";

// Définition du store auth
const useAuth = defineStore("auth", {
  state: () => ({
    token: null,
    user: null,
    game: null,
  }),
  actions: {
    initData() {
      this.token = localStorage.getItem("token");
      this.user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      this.game = localStorage.getItem("game") ? JSON.parse(localStorage.getItem("game")) : null

      if (this.game) {
        useApi().get('/game/salle').then(res => {
          this.saveSession(this.token, res.data.user, res.data.game);
        })
      }
      
    },

    saveSession(token, user, game) {
      localStorage.clear();
      localStorage.setItem("user", user ? JSON.stringify(user) : null);
      localStorage.setItem("token", token);
      localStorage.setItem("game", game ? JSON.stringify(game) : null);

      this.token = token;
      this.user = user;
      this.game = game;
    },

    clearSession() {
      localStorage.clear();
      this.token = null;
      this.user = null;
      this.game = null;
    },
  },
});

export default useAuth;
