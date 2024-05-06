import { defineStore } from "pinia";

// Définition du store auth
const usePopup = defineStore("popup", {
  state: () => ({
    open: false,
    text: "Test",
    type: null,
    timeout: null,
  }),
  actions: {
    send(text, type = null) {
      console.log("POPUp", text);
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.text = text;
      this.type = type;
      this.open = true;

      this.timeout = setTimeout(this.close, 5000);
    },
    close() {
      this.open = false;
    },
  },
});

export default usePopup;
