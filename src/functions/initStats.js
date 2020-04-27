import Stats from "stats-js";

export default function($el) {
  let stats = new Stats();
  stats.setMode(0); // 0: fps, 1: ms
  $el.appendChild(stats.domElement);
  return stats;
}
