<template>
  <div>
    <div class="wrapper">
      <div class="container">
        <router-link to="/">
          <icon-network class="icon" />
        </router-link>
        <router-link to="/rank">
          <icon-list class="icon" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  background: rgba(21, 21, 21, 0.8);
  backdrop-filter: blur(5px);
}
.container {
  justify-content: space-around;
  width: 100%;
  max-width: 600px;
  display: flex;
  margin-left: auto;
  margin-right: auto;
}
.icon {
  stroke: rgba(255, 255, 255, 0.35);
  height: 2.5rem;
  width: 2.5rem;
  padding: 0.25rem;
  margin: 0.5rem;
  border-radius: 50%;
  display: block;
  transition: all 0.1s;
}
.icon:active {
  transform: scale(0.95);
}
.router-link {
  outline: none;
}
.router-link-exact-active .icon {
  stroke: rgba(255, 255, 255, 0.85);
}
</style>

<script>
import IconNetwork from "@/components/IconNetwork.vue";
import IconList from "@/components/IconList.vue";

export default {
  components: {
    IconNetwork,
    IconList,
  },
};
</script>
