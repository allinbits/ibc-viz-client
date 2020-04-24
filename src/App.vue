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
}
* {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
</style>

<script>
import AppLayout from "@/components/AppLayout.vue";

export default {
  components: {
    AppLayout,
  },
};
</script>
