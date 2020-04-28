import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueGtm from "vue-gtm";
import { store } from "./store/index";

Vue.config.productionTip = false;

Vue.use(VueGtm, {
  id: "GTM-WP2T3F5",
  enabled: true,
  debug: true,
  loadScript: true,
  vueRouter: router,
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
