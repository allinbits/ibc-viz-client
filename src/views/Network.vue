<template>
  <div>
    <div class="loading" v-if="loading">
      {{loadingText}}...
    </div>
    <div id="chart"></div>
  </div>
</template>

<style scoped>
#chart {
  width: 100vw;
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 1000;
}
.loading {
  position: fixed;
  width: 100vw;
  text-align: center;
  letter-spacing: 0.01em;
  top: 50vh;
  color: rgba(255, 255, 255, 0.75);
  font-family: sans-serif;
}
</style>

<script>
import axios from "axios";
import echarts from "echarts";
import { v4 as uuidv4 } from "uuid";
import { find, groupBy } from "lodash";
import io from "socket.io-client";

const API = process.env.VUE_APP_API_URL;

const stringToRGB = string => {
  const hashCode = str => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };
  const i = hashCode(string);
  let c = (i & 0x00ffffff).toString(16).toUpperCase();
  return "00000".substring(0, 6 - c.length) + c;
};

export default {
  name: "network",
  data: function() {
    return {
      txs: [],
      socket: null,
      chart: null,
      relations: {},
      blockchains: [],
      loading: true
    };
  },
  watch: {
    txsSendPacket() {
      if (this.chart) {
        this.chart.setOption(this.chartOptions);
      }
    }
  },
  computed: {
    loadingText() {
      const items = [
        "Counting stars",
        "Setting phasers to stun",
        "Reticulating splines",
        "Exploring the universe"
      ];
      return items[Math.floor(Math.random() * items.length)];
    },
    chartOptions() {
      return {
        legend: [
          {
            bottom: 65,
            left: 10,
            right: 10,
            type: "scroll",
            pageIconColor: "#fff",
            pageTextStyle: { color: "fff" },
            selectedMode: "multiple",
            textStyle: {
              color: "#fff",
              padding: 5
            },
            inactiveColor: "#fff",
            data: [...this.blockchainCategories]
          }
        ],
        series: [
          {
            zoom: 2,
            type: "graph",
            layout: "force",
            width: "100px",
            roam: true,
            nodes: [...this.addressNodes, ...this.blockchainNodes],
            links: [...this.addressLinks, ...this.blockchainLinks],
            categories: [...this.blockchainCategories],
            label: {
              formatter: "{b}",
              color: "rgba(255,255,255,.75)",
              position: "top"
            },
            force: {
              edgeLength: 10,
              repulsion: 40,
              gravity: 0.1
            }
          }
        ]
      };
    },
    txsSendPacket() {
      return this.txs.filter(tx => {
        return find(tx.events, { type: "send_packet" });
      });
    },
    addressNodes() {
      let nodes = [];
      this.txsSendPacket.forEach(tx => {
        const send_packet = find(tx.events, { type: "send_packet" }).attributes;
        const t = JSON.parse(find(send_packet, { key: "packet_data" }).val)
          .value;
        nodes.push(t.receiver);
        nodes.push(t.sender);
      });
      const unique = [...new Set(nodes)];
      return unique.map(addr => {
        return {
          id: addr,
          symbolSize: 3,
          name: addr,
          category: this.relationsAll[addr] || "unknown"
        };
      });
    },
    addressLinks() {
      return this.txsSendPacket.map(t => {
        const send_packet = find(t.events, { type: "send_packet" }).attributes;
        const tx = JSON.parse(find(send_packet, { key: "packet_data" }).val)
          .value;
        return {
          source: tx.sender,
          target: tx.receiver,
          symbol: [null, "arrow"],
          symbolSize: 6,
          lineStyle: {
            color: "source",
            curveness: 0.2,
            opacity: 1
          }
        };
      });
    },
    relationsAll() {
      let data = {};
      this.txs.forEach(tx => {
        Object.keys(tx.events).forEach(i => {
          const ev = tx.events[i];
          if (ev.type === "recv_packet") {
            const packet_data = find(ev.attributes, { key: "packet_data" });
            const addr = JSON.parse(packet_data.val).value.receiver;
            data[addr] = tx.domain;
          }
          if (ev.type === "send_packet") {
            const packet_data = find(ev.attributes, { key: "packet_data" });
            const addr = JSON.parse(packet_data.val).value.sender;
            data[addr] = tx.domain;
          }
        });
      });
      return { ...data, ...this.relations };
    },
    blockchainCategories() {
      let categories = this.blockchains.map(name => {
        return {
          name,
          base: name,
          itemStyle: {
            color: `#${stringToRGB(name)}`
          }
        };
      });
      const unknown = {
        name: "unknown",
        base: "unknown",
        itemStyle: {
          color: "#333"
        }
      };
      categories.push(unknown);
      return categories;
    },
    blockchainLinks() {
      return Object.keys(this.relationsAll).map(addr => {
        return {
          source: this.relationsAll[addr],
          target: addr,
          lineStyle: {
            color: "source",
            opacity: 0.2
          }
        };
      });
    },
    blockchainNodes() {
      return this.blockchains.map(c => {
        return {
          id: c,
          symbolSize: 15,
          category: c,
          name: c,
          label: {
            show: true,
            color: "rgba(255,255,255,.5)"
          }
        };
      });
    }
  },
  async mounted() {
    console.log("mounted");
    this.socket = io(`${API}`);
    this.socket.on("tx", tx => {
      console.log(tx);
      this.txs.push(tx);
    });
    this.txs = (await axios.get(`${API}/txs/ibc`)).data;
    this.relations = (await axios.get(`${API}/relations`)).data;
    this.blockchains = (await axios.get(`${API}/blockchains`)).data;
    this.chart = echarts.init(document.getElementById("chart"));
    this.chart.setOption(this.chartOptions);
    this.loading = false;
    window.onresize = this.chart.resize;
  }
};
</script>