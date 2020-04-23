<template>
  <div>
    <div class="container">
      <div
        :class="['item', `item__status__${item.status}`]"
        v-for="item in sorted"
        :key="item.blockchain"
      >
        <icon-circle class="item__icon" />
        <div class="item__label">
          <div>{{ item.blockchain }}</div>
        </div>
        <div>{{ item.txs_count }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  background: rgba(30, 30, 30, 0.9);
  padding: 1rem 1.5rem;
  color: rgba(255, 255, 255, 0.5);
  font-family: sans-serif;
  border-radius: 0.5rem;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);
}
.item {
  width: 100%;
  margin: 0.5rem 0;
  display: grid;
  grid-template-columns: 0.5rem 1fr min-content;
  letter-spacing: 0.02em;
  gap: 1rem;
  align-items: center;
}
.item__icon {
  width: 0.5rem;
  height: 0.5rem;
  fill: rgba(255, 255, 255, 0.1);
}
.item__status__down .item__icon {
  fill: rgb(130, 0, 0);
}
.item__status__up .item__icon {
  fill: rgb(0, 100, 0);
}
.item__label {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}
</style>

<script>
import axios from "axios";
import { orderBy, find } from "lodash";
import IconCircle from "@/components/IconCircle.vue";

const API = process.env.VUE_APP_API_URL;

export default {
  components: {
    IconCircle,
  },
  data: function() {
    return {
      blockchains: [],
    };
  },
  computed: {
    sorted() {
      return orderBy(
        this.blockchains,
        ["status", "txs_count"],
        ["desc", "desc"]
      );
    },
  },
  async created() {
    this.blockchains = (await axios.get(`${API}/blockchains`)).data.map((b) => {
      return {
        ...b,
        status: null,
      };
    });
    this.blockchains.forEach(async (b) => {
      const item = find(this.blockchains, ["blockchain", b.blockchain]);
      let status;
      try {
        await axios.get(`${API}/health?blockchain=${b.blockchain}`);
        status = "up";
      } catch {
        status = "down";
      }
      this.$set(item, "status", status);
    });
  },
};
</script>
