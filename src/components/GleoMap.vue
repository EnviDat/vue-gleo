<script setup lang="ts">
import { onMounted } from "vue";

import GleoMap from "gleo/src/Map.mjs";
// import AcetateTintedSprite from "gleo/src/acetates/AcetateTintedSprite.mjs"
import Fill from "gleo/src/symbols/Fill.mjs";
import Hair from "gleo/src/symbols/Hair.mjs";
import Sprite from "gleo/src/symbols/Sprite.mjs";
// import TintedSprite from "gleo/src/symbols/TintedSprite.mjs";
import Geometry from "gleo/src/geometry/Geometry.mjs";
import LngLat from "gleo/src/geometry/LngLat.mjs";
import epsg4326 from "gleo/src/crs/epsg4326.mjs";
import epsg3857 from "gleo/src/crs/epsg3857.mjs";
import BaseCRS from "gleo/src/crs/BaseCRS.mjs";
import "gleo/src/actuators/DragActuator.mjs";
import "gleo/src/actuators/WheelActuator.mjs";
import "gleo/src/actuators/InertiaActuator.mjs";
import proj4 from "gleo/src/3rd-party/proj4js/proj4-src.js";
import { enableProj } from "gleo/src/crs/projector.mjs";
import type { Feature as GeoJSONFeature } from "types/geojson";

const mapParentDiv = $ref<HTMLElement>();
let map = $ref<GleoMap>(null);
// let spriteLayer = $ref<AcetateTintedSprite>(null);
// let polygonFill = $ref<Fill>(null);
let fillArray = $ref<Array<Fill>>([]);

enableProj(proj4);
proj4.defs(
  "EPSG:3995",
  "+proj=stere +lat_0=90 +lat_ts=71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
);
const epsg3995 = $ref(new BaseCRS("EPSG:3995"));

proj4.defs(
  "LCC",
  "+proj=lcc +lat_1=43 +lat_2=62 +lat_0=30 +lon_0=10 +x_0=0 +y_0=0 +ellps=intl +units=m +no_defs"
);
const lcc = $ref(new BaseCRS("LCC"));

proj4.defs(
  "sinusoidal",
  "+proj=sinu +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
);
const sinusoidal = $ref(new BaseCRS("sinusoidal"));

proj4.defs(
  "mollweide",
  "+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
);
const mollweide = $ref(new BaseCRS("mollweide"));

proj4.defs(
  "EPSG:25830",
  "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);
const epsg25830 = $ref(new BaseCRS("EPSG:25830", { wrapPeriodY: 40000000 }));

proj4.defs(
  "EPSG:25810",
  "+proj=utm +zone=10 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);
const epsg25810 = $ref(new BaseCRS("EPSG:25810", { wrapPeriodY: 40000000 }));

proj4.defs(
  "EPSG:25840",
  "+proj=utm +zone=50 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);
const epsg25840 = $ref(new BaseCRS("EPSG:25840", { wrapPeriodY: 40000000 }));

defineProps({
  isMinimap: {
    type: Boolean,
    default: false,
  },
});

function reproject(crs: BaseCRS, lnglat: Array<Number>, scale: number) {
  map.setView({ crs: crs, center: new LngLat(lnglat), scale: scale });
}
function updateFillColour(colour: string) {
  // polygonFill.colour = colour;
  fillArray.forEach((x) => {
    console.log();
    x.colour = colour;
  });
}

onMounted(() => {
  map = new GleoMap(mapParentDiv);

  map.setView({
    crs: epsg4326,
    center: new LngLat([8.22, 46.8]),
    scale: 0.05,
  });

  fetch("./ne_110m_coastline.geojson")
    .then((response) => response.json())
    .then((json) => {
      const coastHairs = json.features.map((feat: GeoJSONFeature) => {
        if (feat.geometry.type === "LineString") {
          return new Hair(new Geometry(epsg4326, feat.geometry.coordinates), {
            colour: "blue",
            attribution: "Natural Earth coastlines",
          });
        }
      });

      map.multiAdd(coastHairs);
      map.redraw();
    });

  // const colourRamp = [
  //   "#7fc97f",
  //   "#beaed4",
  //   "#fdc086",
  //   "#ffff99",
  //   "#386cb0",
  //   "#f0027f",
  //   "#bf5b17",
  // ];

  // fetch("./geoBoundariesCGAZ_ADM0.simplify100usr.geojson")
  //   .then((response) => response.json())
  //   .then((json) => {
  //     const countryFills = json.features.map(
  //       (feat: GeoJSONFeature) =>
  //         new Fill(new Geometry(epsg4326, feat.geometry.coordinates), {
  //           colour: colourRamp[feat?.properties?.color_id - 1],
  //           attribution:
  //             "<a href='https://www.geoboundaries.org'>geoboundaries</a>",
  //         })
  //     );

  //     map.multiAdd(countryFills);
  //     // map.redraw();
  //   });

  fetch("./gendib_27_02_2023.geojson")
    .then((response) => response.json())
    .then((json) => {
      fillArray = json.features.map((feat: GeoJSONFeature) => {
        if (feat.geometry.type === "Point") {
          return new Fill(
            new Geometry(epsg4326, [
              [feat.geometry.coordinates[0], feat.geometry.coordinates[1]],
              [
                feat.geometry.coordinates[0] + 0.05,
                feat.geometry.coordinates[1],
              ],
              [
                feat.geometry.coordinates[0] + 0.05,
                feat.geometry.coordinates[1] + 0.05,
              ],
              [
                feat.geometry.coordinates[0],
                feat.geometry.coordinates[1] + 0.05,
              ],
              [feat.geometry.coordinates[0], feat.geometry.coordinates[1]],
            ]),
            {
              colour: "red",
              radius: 6,
              attribution:
                "<a href='https://www.geoboundaries.org'>geoboundaries</a>",
            }
          );
        }
      });

      map.multiAdd(fillArray);
      map.redraw();
    });

  // const spriteopts = {
  //   interactive: true,
  //   image: "./leaflet-marker-icon.png",
  //   imageSize: [25, 41],
  //   spriteAnchor: [12, 41],
  // };
  // const spriteMAD = new Sprite(
  //   new LngLat([-3.6852975, 40.40197212]),
  //   spriteopts
  // );
  // const spriteTRD = new Sprite(
  //   new LngLat([10.4166662, 63.41665753]),
  //   spriteopts
  // );
  // map.multiAdd([spriteMAD, spriteTRD]);

  // spriteLayer = map.platina.getAcetateOfClass(TintedSprite.Acetate);

  // let sprite =  new TintedSprite(new LngLat([-58.399477, -34.60055574]), {
  //     image: "./leaflet-marker-icon.png",
  //     imageSize: [25, 41],
  //     spriteAnchor: [12, 41],
  //     tint: spriteTint,
  //   });
  // spriteLayer.add(sprite);

  // map.redraw()

  // const sprites = [];
  // for (let x = 0; x < 359; x += 15) {
  //   for (let y = 70; y < 89; y += 5) {
  //     sprites.push(new Sprite(new LngLat([x, y]), spriteopts));
  //   }
  // }
  // map.add(sprites);
});
</script>

<template>
  <div
    ref="mapParentDiv"
    style="width: 80vw; height: 80vh; display: inline-block"
    :class="isMinimap ? 'minimap' : 'absolute-full'"
  ></div>
  <div>
    <button @click="reproject(epsg4326, [0, 40], 0.2)" id="4326">4326</button>
    <button @click="reproject(epsg3857, [0, 40], 20000)" id="3857">3857</button>
    <button @click="reproject(epsg3995, [0, 40], 20000)" id="3995">3995</button>
    <button @click="reproject(lcc, [0, 40], 20000)" id="LCC">LCC</button>
    <button @click="reproject(sinusoidal, [0, 40], 20000)" id="sinusoidal">
      sinusoidal
    </button>
    <button @click="reproject(mollweide, [0, 40], 20000)" id="mollweide">
      mollweide
    </button>
    <button @click="reproject(epsg25810, [-90, 40], 20000)" id="25810">
      25810
    </button>
    <button @click="reproject(epsg25830, [0, 40], 20000)" id="25830">
      25830
    </button>
    <button @click="reproject(epsg25840, [90, 40], 20000)" id="25840">
      25840
    </button>
    <br />
    <br />
    <button @click="updateFillColour('blue')" id="blue">Blue</button>
    <button @click="updateFillColour('green')" id="green">Green</button>
    <button @click="updateFillColour('red')" id="green">Red</button>
  </div>
</template>
