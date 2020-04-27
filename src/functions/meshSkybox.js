import * as THREE from "three";

let imagePrefix = "images/bkg1_";
let directions = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
let imageSuffix = ".png";
let skyGeometry = new THREE.CubeGeometry(10000, 10000, 10000);

let loader = new THREE.TextureLoader();
let materialArray = [];
for (let i = 0; i < 6; i++) {
  let texture = loader.load(imagePrefix + directions[i] + imageSuffix);
  materialArray.push(
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide
    })
  );
}
let skyMaterial = materialArray;
let mesh = new THREE.Mesh(skyGeometry, skyMaterial);

export default mesh;
