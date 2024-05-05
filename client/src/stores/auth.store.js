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

      if (this.token) {
        useApi().get('/game/salle').then(res => {
          this.saveSession(this.token, res.data.user, res.data.game);
        })
      }
      
    },

    saveSession(token, user, game) {
      localStorage.clear();
      localStorage.setItem("token", token);

      this.token = token;
      this.user = user;
      this.game = game;

      console.log(user, game)
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
