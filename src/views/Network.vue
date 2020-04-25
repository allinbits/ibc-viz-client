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
      txs: [],
      socket: null,
      chart: null,
    };
  },
  computed: {
    addressLinks() {
      return this.txs.map((tx) => {
        return {
          source: tx.sender,
          target: tx.recipient,
          symbol: [null, "arrow"],
          symbolSize: 6,
          lineStyle: {
            color: "source",
            opacity: tx.type === "ibc_transfer" ? 1 : 0.2,
          },
        };
      });
    },
    addressNodes() {
      const senders = this.txs.map((tx) => tx.sender);
      const recipients = this.txs.map((tx) => tx.recipient);
      const addresses = [...new Set([...senders, ...recipients])];
      return addresses.map((addr) => {
        return {
          id: addr,
          symbolSize: 3,
          category: this.addressBlockchainMap[addr],
          name: addr,
        };
      });
    },
    addressBlockchainMap() {
      let map = {};
      this.txs.forEach((tx) => {
        map[tx.sender] = tx.blockchain;
      });
      return map;
    },
    blockchainCategories() {
      const cat = [...new Set(Object.values(this.addressBlockchainMap))];
      return cat.map((c) => {
        return {
          name: c,
          base: c,
        };
      });
    },
    blockchainLinks() {
      return this.txs.map((tx) => {
        return {
          source: tx.blockchain,
          target: tx.sender,
          lineStyle: {
            color: "source",
            opacity: 0.2,
          },
        };
      });
    },
    blockchainNodes() {
      const chains = [...new Set(this.txs.map((tx) => tx.blockchain))];
      return chains.map((c) => {
        return {
          id: c,
          symbolSize: 20,
          category: c,
          name: c,
          label: {
            show: true,
            color: "rgba(255,255,255,.5)",
          },
        };
      });
    },
  },
  async mounted() {
    this.socket = io(`${API}`);
    this.socket.on("tx", (tx) => {
      console.log(tx);
      this.txs.push(tx);
    });
    this.txs.push(...(await axios.get(`${API}/transfers`)).data);
    this.chart = echarts.init(document.getElementById("chart"));
    this.chart.setOption({
      legend: [
        {
          type: "scroll",
          pageIconColor: "#fff",
          pageTextStyle: { color: "fff" },
          selectedMode: "multiple",
          textStyle: {
            color: "#fff",
            padding: 5,
          },
          inactiveColor: "#fff",
          // data: [...this.blockchainsCategories],
        },
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
            position: "top",
          },
          force: {
            edgeLength: 5,
            repulsion: 20,
            gravity: 0.2,
          },
        },
      ],
    });
    window.onresize = this.chart.resize;
  },
};
</script>
