<template>
  <div>
    <div class="container">
      <div class="item item__heading">
        <div class="item__name">Blockchain</div>
        <div class="item__value">↓</div>
        <div class="item__value">↑</div>
        <div class="item__value">∑<sub>tx</sub></div>
      </div>
      <div
        :class="['item', `item__status__${status(item.status)}`]"
        v-for="item in sorted"
        :key="item.blockchain"
      >
        <div class="item__label">
          <div>
            {{ item.blockchain }}
            <sup v-if="status(item.status) === 'down'">offline</sup>
          </div>
        </div>
        <div class="item__value" :title="item.incoming">{{ kFormatter(item.incoming) }}</div>
        <div class="item__value" :title="item.outgoing">{{ kFormatter(item.outgoing) }}</div>
        <div class="item__value" :title="item.total">{{ kFormatter(item.total) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
sup,
sub {
  vertical-align: baseline;
  position: relative;
  top: -0.4em;
}
sub {
  top: 0.4em;
}
.container {
  padding: 1rem 1rem;
  color: rgba(255, 255, 255, 0.75);
  font-family: sans-serif;
  border-radius: 0.5rem;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);
  margin: 0.75rem auto;
  max-width: 600px;
}
.item {
  width: 100%;
  margin: 0.75rem 0;
  display: grid;
  grid-template-columns: 1fr 2.5rem 2.5rem 2.5rem;
  letter-spacing: 0.02em;
  gap: 1rem;
  align-items: center;
  line-height: 1.5;
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
  overflow: hidden;
  white-space: nowrap;
}
.item__value {
  text-align: right;
}
.item__heading {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: "Montserrat";
  color: white;
  font-size: 0.875rem;
  font-weight: bold;
}
.item__heading .item__value {
  font-family: sans-serif;
}
.item__status__down {
  color: rgba(255, 255, 255, 0.25);
}
</style>

<script>
import axios from "axios";
import { orderBy, find } from "lodash";
import IconCircle from "@/components/IconCircle.vue";

const API = process.env.VUE_APP_API_URL;

function kFormatter(num) {
  if (Math.abs(num) > 999) {
    return Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "K";
  } else {
    return Math.sign(num) * Math.abs(num);
  }
}

export default {
  name: "zones",
  components: {
    IconCircle
  },
  data: function() {
    return {
      blockchains: []
    };
  },
  computed: {
    sorted() {
      const blockchains = this.blockchains.map(b => {
        return {
          ...b,
          total: b.incoming + b.outgoing
        };
      });
      return orderBy(blockchains, ["status", "total"], ["desc", "desc"]);
    }
  },
  methods: {
    status(n) {
      if (n === 2) return "up";
      if (n === 1) return "down";
      return "unknown";
    },
    kFormatter
  },
  async created() {
    this.blockchains = (await axios.get(`${API}/ranking`)).data.map(b => {
      return {
        ...b,
        status: 0
      };
    });
    this.blockchains.forEach(async b => {
      const item = find(this.blockchains, ["blockchain", b.blockchain]);
      let status;
      try {
        await axios.get(`${API}/health?blockchain=${b.blockchain}`);
        status = 2;
      } catch {
        status = 1;
      }
      this.$set(item, "status", status);
    });
  }
};
</script>
