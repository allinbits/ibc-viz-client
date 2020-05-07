<template>
  <div id="app">
    <app-layout />
  </div>
</template>

<style>
html {
  background: rgb(21, 21, 21);
}
body {
  margin: 0;
  font-family: sans-serif;
}
* {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<script>
import AppLayout from "@/components/AppLayout.vue";

export default {
  components: {
    AppLayout
  },
  created() {
    this.$store.dispatch("socketSubscribe");
    this.$store.dispatch("blockchainsFetch");
    // this.$store.dispatch("relationsFetch");
    // this.$store.dispatch("connectionsFetch");
    // this.$store.dispatch("counterpartyClientIdFetch");
    // this.$store.dispatch("createClientFetch");
  }
};
</script>
