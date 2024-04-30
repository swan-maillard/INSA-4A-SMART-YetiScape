import { createWebHistory, createRouter } from "vue-router";

import HomeView from "./views/HomeView.vue";
import WaitingView from "./views/WaitingView.vue";

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
  ],
});

export default router;
