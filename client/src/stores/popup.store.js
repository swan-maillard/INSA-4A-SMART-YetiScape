import { defineStore } from "pinia";

// Définition du store auth
const usePopup = defineStore("popup", {
  state: () => ({
    open: false,
    text: "",
    type: null,
  }),
  actions: {
    send(text, type = null) {
      this.text = text;
      this.type = type;
      this.open = true;

      setTimeout(this.close, 5000);
    },
    close() {
      this.open = false;
    },
  },
});

export default usePopup;
