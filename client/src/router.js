import { createWebHistory, createRouter } from "vue-router";

import HomeView from "./views/HomeView.vue";
import WaitingView from "./views/WaitingView.vue";
import Room1View from "./views/Room1View.vue";
import Room2View from "./views/Room2View.vue";

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
    {
      path: "/room2",
      name: "room2",
      component: Room2View,
    },
  ],
});

export default router;
