//Credit to https://github.com/brian-hay/celestial-sphere/tree/master
//Slight reduction in code by removing asterisms and constellation lines and adding tree shaking
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData.js";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import { Texture } from "@babylonjs/core/Materials/Textures/texture.js";
import { Scene } from "@babylonjs/core/scene.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { CreateTube } from "@babylonjs/core/Meshes/Builders/tubeBuilder.js";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer.js";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { Scalar } from "@babylonjs/core/Maths/math.scalar.js";
import noiseUrl from "../../../../assets/space/noise.png";
import StarDataJSON from "../../../../assets/space/star-data.json";
import starUrl from "../../../../assets/space/star.png";
import tubeUrl from "../../../../assets/space/tube.png";

export interface StarData {
  rightAscension: number[];
  declination: number[];
  apparentMagnitude: number[];
  colorIndexBV: number[];
  color: number[][];
}

export class CelestialSphere {
  private starData: StarData;
  private radius: number;
  private starLimit: number; // Show this many of the brightest stars as mapped triangles.
  private starScale: number; // 0.4 // Size of largest star (larger/brighter stars are factors of this number).
  private twinkleStars: boolean = true;

  constructor({
    scene,
    starData,
    radius,
    starLimit,
    starScale,
    twinkleStars,
  }: {
    scene: Scene;
    starData: StarData;
    radius: number;
    starLimit: number;
    starScale: number;
    twinkleStars: boolean;
  }) {
    this.starData = starData;
    this.radius = radius;
    this.starLimit = starLimit;
    this.starScale = starScale;
    this.twinkleStars = twinkleStars;

    // Add empty celestial sphere mesh.
    const starMesh = new Mesh("starMesh", scene);
    starMesh.alphaIndex = 20;

    // Mesh vertex data arrays.
    const positions = [];
    const indices = [];
    const colors = [];
    const uvs = [];
    const uvs2 = [];

    let vertexIndex = 0;
    const numberOfStars = Math.min(
      starData.rightAscension.length,
      this.starLimit
    );

    // Populate vertex data arrays for each star.
    for (let starIndex = 0; starIndex < numberOfStars; starIndex++) {
      // Star celestial coordinates.
      const ra = this.starData.rightAscension[starIndex]; // eastward in radians (around Y axis - yaw)
      const dec = this.starData.declination[starIndex]; // north-south in radians (around X axis - pitch)

      // Star scale factor (based on apparent magnitude).
      var s = this.starScaleFactor(starIndex);

      // Create star vertices around +Z axis & scale to size.
      let v1 = new Vector3(0.0 * s, 0.7 * s, this.radius);
      let v2 = new Vector3(-0.5 * s, -0.3 * s, this.radius);
      let v3 = new Vector3(0.5 * s, -0.3 * s, this.radius);

      // Rotate vertices into position on celestial sphere.
      const rotationMatrix = Matrix.RotationYawPitchRoll(-ra, -dec, 0);
      v1 = Vector3.TransformCoordinates(v1, rotationMatrix);
      v2 = Vector3.TransformCoordinates(v2, rotationMatrix);
      v3 = Vector3.TransformCoordinates(v3, rotationMatrix);

      // Add vertex positions.
      positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);

      // Add vertex color.
      const c = this.starColor(starIndex);
      colors.push(c.r, c.g, c.b, c.a, c.r, c.g, c.b, c.a, c.r, c.g, c.b, c.a);

      // Add star texture UV coordinates.
      uvs.push(0.5, 1.0, 0.0, 0.0, 1.0, 0.0);

      // Add 'twinkle' (noise) texture UV coordinates.
      const u = Math.random();
      const v = Math.random();
      uvs2.push(u, v, u, v, u, v);

      // Add indices.
      indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
      vertexIndex += 3;
    }

    // Create & assign vertex data to mesh.
    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.colors = colors;
    vertexData.uvs = uvs;
    vertexData.uvs2 = uvs2;
    vertexData.applyToMesh(starMesh);

    // Create & assign star material.
    const starMaterial = new StandardMaterial("starMaterial", scene);
    const opacityTexture = new Texture(starUrl, scene);
    starMaterial.opacityTexture = opacityTexture;
    starMaterial.disableLighting = true;
    starMesh.material = starMaterial;

    // Twinkle stars (simulate atmospheric turbulence).
    if (this.twinkleStars) {
      const emissiveTexture = new Texture(noiseUrl, scene);
      starMaterial.emissiveTexture = emissiveTexture;
      emissiveTexture.coordinatesIndex = 1; // uvs2

      // Animate emissive texture to simulate star 'twinkle' effect.
      scene.registerBeforeRender(() => {
        emissiveTexture.uOffset += 0.008;
      });
    } else {
      starMaterial.emissiveColor = new Color3(1, 1, 1);
    }

    // Draw celestial equator.
    const points = [];
    const steps = 100;
    for (let i = 0; i < steps + 1; i++) {
      const a = (Math.PI * 2 * i) / steps;
      const x = Math.cos(a) * this.radius;
      const y = 0;
      const z = Math.sin(a) * this.radius;

      points.push(new Vector3(x, y, z));
    }

    radius += 20;
    //Array of paths to construct tube
    const c = 2 * Math.PI * radius;
    const h = c / 4 / 2;
    const myPath = [new Vector3(0, 0, h), new Vector3(0, 0, -h)];

    //Create ribbon with updatable parameter set to true for later changes
    const tubeParentXform = new TransformNode("tubeParentXform", scene);
    const tubeChildXform = new TransformNode("tubeChildXform", scene);
    const tube = CreateTube(
      "tube",
      {
        path: myPath,
        radius: radius,
        sideOrientation: Mesh.BACKSIDE,
        updatable: false,
      },
      scene
    );
    tube.alphaIndex = 0;
    const tubeTexture = new Texture(tubeUrl, scene, true, false);
    tubeTexture.vScale = -1;
    tube.parent = tubeChildXform;
    tubeChildXform.parent = tubeParentXform;
    tube.rotate(new Vector3(0, 0, -1), 0.57);
    tubeChildXform.rotate(new Vector3(1, 0, 0), 0.48);
    tubeParentXform.rotate(new Vector3(0, -1, 0), 0.22);
    const tubeMaterial = new StandardMaterial("skyBox", scene);
    tubeMaterial.backFaceCulling = true;
    tubeMaterial.disableLighting = true;
    tubeMaterial.emissiveTexture = tubeTexture;
    tube.material = tubeMaterial;
    tube.material.alpha = 0.5;
  }

  /*
   *  Look-up star color using star's color index B-V.
   *
   *  See: https://en.wikipedia.org/wiki/Color_index
   *  Blue-white-red star color range from http://www.vendian.org/mncharity/dir3/starcolor/details.html
   */
  private starColor(starIndex: number): Color4 {
    // Normalize star color fraction from colorIndexBV range of -0.4-2.0 to 0.0-1.0.
    const fraction = Scalar.Normalize(
      this.starData.colorIndexBV[starIndex],
      -0.4,
      2.0
    );

    // Calculate star color index.
    const maxColorIndex = this.starData.color.length - 1;
    let colorIndex = Math.round(maxColorIndex * fraction);
    colorIndex = Scalar.Clamp(colorIndex, 0, maxColorIndex);

    // Look-up and return star color.
    const c = this.starData.color[colorIndex];
    return new Color4(c[0], c[1], c[2], 0);
  }

  /*
   *  Compute star scale factor based on apparent magnitude.
   */
  private starScaleFactor(starIndex: number) {
    // Magnitude is counterintuitive - lower values are hgiher magnitudes!
    // "Lowest" magnitude in star data is 7.8, "highest" is -1.44 for Sirius.
    // So we need to invert these & ensure positive to get scale that approximates magnitude.
    return (8 - this.starData.apparentMagnitude[starIndex]) * this.starScale;
  }
}

export function createCelestialSphere(scene: Scene) {
  scene.clearColor = new Color4(0, 0, 0, 1.0);
  const gl = new GlowLayer("glow", scene);
  gl.intensity = 1;
  return new CelestialSphere({
    scene,
    starData: StarDataJSON,
    radius: 300,
    starLimit: 5000,
    starScale: 0.5,
    twinkleStars: true,
  });
}
