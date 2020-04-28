<template>
  <div>
    <div :class="['wrapper', `dark__${dark}`]">
      <div class="container">
        <router-link to="/" class="button">
          <icon-network class="icon" />
          <div>Graph</div>
        </router-link>
        <!-- <router-link to="/3d" class="button">
          <icon-world class="icon" />
          <div>Universe</div>
        </router-link> -->
        <router-link to="/rank" class="button">
          <icon-list class="icon" />
          <div>Zones</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  background: rgba(21, 21, 21, 0.75);
  backdrop-filter: blur(5px);
}
.dark__true.wrapper {
  background: rgba(0, 0, 0, 0.5);
}
.container {
  justify-content: space-around;
  width: 100%;
  max-width: 600px;
  display: flex;
  margin-left: auto;
  margin-right: auto;
}
.button {
  padding: 0.25rem;
  margin: 0.5rem;
  display: flex;
  align-content: center;
  align-items: center;
  flex-direction: column;
  color: rgba(255, 255, 255, 0.65);
  font-family: "Montserrat", sans-serif;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  font-size: 0.6rem;
  font-weight: 600;
}
.icon {
  stroke: rgb(255, 255, 255, 0.35);
  height: 2.5rem;
  width: 2.5rem;
  margin-bottom: 0.35rem;
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
.router-link-exact-active.button {
  color: rgba(255, 255, 255, 1);
}
.router-link-exact-active .icon {
  stroke: rgb(255, 255, 255, 0.85);
}
</style>

<script>
import IconNetwork from "@/components/IconNetwork.vue";
import IconWorld from "@/components/IconWorld.vue";
import IconList from "@/components/IconList.vue";

export default {
  components: {
    IconNetwork,
    IconList,
    IconWorld
  },
  props: {
    dark: {
      type: Boolean,
      default: false
    }
  }
};
</script>
