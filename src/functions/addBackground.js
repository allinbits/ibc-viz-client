import * as THREE from "three";
import materials from "../store/modules/materials.js";

export default function(scene) {
  let meshPlanet = new THREE.Mesh(
    new THREE.SphereGeometry(72, 24, 24),
    materials.state.planet.default
  );
  meshPlanet.renderOrder = 1;

  let meshBlock = new THREE.Mesh(
    new THREE.CubeGeometry(24, 24, 24),
    materials.state.ring.proposer
  );
  meshBlock.renderOrder = 0;
  meshBlock.name = "meshBlock";

  scene.add(meshBlock);
  scene.add(meshPlanet);
  // scene.add(new THREE.GridHelper(400, 10));
}
