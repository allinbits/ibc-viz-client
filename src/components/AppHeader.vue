<template>
  <div>
    <div class="wrapper">
      <div class="container">
        <div class="h1">
          Game of Zones Visualizer
        </div>
        <div class="h2">by AiB Inc.</div>
      </div>
      <router-link to="/about" tag="div">
        <icon-info class="icon-info"/>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100vw;
  display: flex;
  background: rgba(21, 21, 21, 0.75);
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  box-sizing: border-box;
  backdrop-filter: blur(5px);
}
.container {
  color: rgba(255, 255, 255, 0.9);
  font-family: "Montserrat", sans-serif;
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.h2 {
  font-size: 0.75rem;
  opacity: 0.5;
}
.icon-info {
  width: 1.25rem;
  height: 1.25rem;
  fill: rgba(255, 255, 255, 0.5);
  transition: all 0.1s;
  cursor: pointer;
}
.icon-info:active {
  transform: scale(0.95);
}
.router-link-exact-active .icon-info {
  fill: rgba(255, 255, 255, 0.85);
}
</style>

<script>
import IconInfo from "@/components/IconInfo.vue";

export default {
  components: {
    IconInfo
  }
};
</script>