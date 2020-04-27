import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueGtm from "vue-gtm";

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
  render: h => h(App)
}).$mount("#app");
