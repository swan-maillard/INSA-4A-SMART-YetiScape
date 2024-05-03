import { createWebHistory, createRouter } from "vue-router";

import HomeView from "./views/HomeView.vue";
import WaitingView from "./views/WaitingView.vue";
import Room1View from "./views/Room1View.vue";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/waiting",
      name: "waiting",
      component: WaitingView,
    },
    {
      path: "/room1",
      name: "room1",
      component: Room1View,
    },
  ],
});

export default router;
