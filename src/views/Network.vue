<template>
  <div id="chart" style="width: 100vw; height: 100vh"></div>
</template>

<script>
import axios from "axios";
import echarts from "echarts";
import { v4 as uuidv4 } from "uuid";
import { find, groupBy } from "lodash";
import io from "socket.io-client";

const API = process.env.VUE_APP_API_URL;

export default {
  data: function() {
    return {
      txsAll: [],
      socket: null,
      chart: null,
    };
  },
  // beforeRouteEnter(to, from, next) {
  //   if (to.chart) {
  //     to.chart.resize();
  //   }
  //   next();
  // },
  computed: {
    txs() {
      return this.txsAll;
    },
    blockchainAddress() {
      let nodes = {};
      this.txs.forEach((tx) => {
        const create_client = find(tx.events.events, {
          action: "create_client",
        });
        const send = find(tx.events.events, { action: "send" });
        if (create_client || send) {
          const address = find(tx.events.events, "sender").sender;
          nodes[address] = tx.blockchain;
        }
      });
      return nodes;
    },
    blockchainAddressLinks() {
      return Object.keys(this.blockchainAddress).map((address) => {
        return {
          source: this.blockchainAddress[address],
          target: address,
          lineStyle: {
            color: "source",
          },
        };
      });
    },
    blockchainNodes() {
      const data = [...new Set(this.txs.map((tx) => tx.blockchain))];
      return data.map((blockchain) => {
        return {
          id: blockchain,
          symbolSize: 15,
          category: blockchain,
          name: blockchain,
          label: {
            show: true,
            color: "rgba(255,255,255,.5)",
          },
        };
      });
    },
    addressNodes() {
      let nodes = [];
      this.txs.forEach((tx) => {
        const send = find(tx.events.events, { action: "send" });
        if (send) {
          const recipient = find(tx.events.events, "recipient").recipient;
          const sender = find(tx.events.events, "sender").sender;
          nodes.push(recipient);
          nodes.push(sender);
        }
      });
      nodes = [...new Set(nodes)];
      return nodes.map((address) => {
        return {
          id: address,
          symbolSize: 3,
          category: this.blockchainAddress[address],
          name: address,
        };
      });
    },
    addressLinks() {
      let sends = this.txs.filter((tx) => {
        return find(tx.events.events, { action: "send" });
      });
      return sends.map((tx) => {
        return {
          target: find(tx.events.events, "recipient").recipient,
          source: find(tx.events.events, "sender").sender,
          lineStyle: {
            color: "source",
            curveness: 0.3,
          },
        };
      });
    },
    blockchainCategories() {
      const data = [...new Set(this.txs.map((tx) => tx.blockchain))];
      return data.map((b) => {
        return {
          name: b,
          base: b,
        };
      });
    },
  },
  async mounted() {
    this.socket = io(`${API}`);
    this.socket.on("tx", (tx) => {
      console.log(tx);
    });
    this.txsAll = (await axios.get(`${API}/txs`)).data;
    this.chart = echarts.init(document.getElementById("chart"));
    this.chart.setOption({
      legend: [{
        type: "scroll",
        pageIconColor: "#fff",
        pageTextStyle: {color: "fff"},
        selectedMode: "multiple",
        textStyle: {
          color: "#fff",
          padding: 5
        },
        inactiveColor: "#fff",
        data: [...this.blockchainCategories],
      }],
      series: [
        {
          zoom: 2,
          type: "graph",
          layout: "force",
          width: "100px",
          roam: true,
          nodes: [...this.addressNodes, ...this.blockchainNodes],
          links: [...this.addressLinks, ...this.blockchainAddressLinks],
          categories: [...this.blockchainCategories],
          label: {
            formatter: "{b}",
            color: "rgba(255,255,255,.75)",
            position: "top",
          },
          force: {
            edgeLength: 5,
            repulsion: 20,
            gravity: 0.2,
          },
          tooltip: {
            position: "right",
            formatter: "123",
          },
        },
      ],
    });
    window.onresize = this.chart.resize;
  },
};
</script>
