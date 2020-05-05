<template>
  <div>
    <div class="container">
      <div class="item item__heading">
        <div class="item__name">Blockchain</div>
        <div class="item__value">↓</div>
        <div class="item__value">↑</div>
        <div class="item__value">∑<sub>tx</sub></div>
      </div>
      <div class="item" v-for="item in sorted" :key="item.node_addr">
        <div class="item__label">{{item.chain_id}}</div>
        <div class="item__value" v-if="ranking[item.node_addr]">{{ kFormatter(ranking[item.node_addr].incoming) }}</div>
        <div class="item__value" v-if="ranking[item.node_addr]">{{ kFormatter(ranking[item.node_addr].outgoing) }}</div>
        <div class="item__value" v-if="ranking[item.node_addr]">{{ kFormatter(ranking[item.node_addr].incoming + ranking[item.node_addr].outgoing) }}</div>
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
import { mapGetters } from "vuex";

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
      blockchains: [],
      ranking: {}
    };
  },
  watch: {
    socketMessages(newVal) {
      const tx = newVal[newVal.length - 1];
      const incoming = find(Object.values(tx.events), ["type", "recv_packet"]);
      const outgoing = find(Object.values(tx.events), ["type", "send_packet"]);
      if (incoming) this.ranking[tx.domain].incoming++;
      if (outgoing) this.ranking[tx.domain].outgoing++;
    }
  },
  computed: {
    ...mapGetters(["socketMessages"]),
    sorted() {
      const blockchains = this.blockchains.map(b => {
        const count = this.ranking[b.node_addr] || {};
        const incoming = count.incoming || 0;
        const outgoing = count.outgoing || 0;
        return {
          ...b,
          incoming,
          outgoing,
          total: incoming + outgoing
        };
      });
      return orderBy(blockchains, ["status", "total"], ["desc", "desc"]);
    }
  },
  methods: {
    // status(n) {
    //   if (n === 2) return "up";
    //   if (n === 1) return "down";
    //   return "unknown";
    // },
    kFormatter
  },
  async created() {
    axios.get(`${API}/blockchains`).then(({ data }) => {
      this.blockchains = data.map(b => {
        return {
          ...b,
          node_addr: b.node_addr.split(":")[0]
        };
      });
    });
    axios.get(`${API}/ranking`).then(({ data }) => {
      this.ranking = data;
    });
    // this.blockchains = (await axios.get(`${API}/ranking`)).data.map(b => {
    //   return {
    //     ...b,
    //     status: 0
    //   };
    // });
    // this.blockchains.forEach(async b => {
    //   const item = find(this.blockchains, ["blockchain", b.blockchain]);
    //   let status;
    //   try {
    //     await axios.get(`${API}/health?blockchain=${b.blockchain}`);
    //     status = 2;
    //   } catch {
    //     status = 1;
    //   }
    //   this.$set(item, "status", status);
    // });
  }
};
</script>
