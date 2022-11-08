<script setup lang='ts'>
  import { onMounted } from 'vue'

  import GleoMap from '@gleo/Map.mjs'
  import Fill from '@gleo/symbols/Fill.mjs'
  import Hair from '@gleo/symbols/Hair.mjs'
  import Sprite from '@gleo/symbols/Sprite.mjs'
  import Geometry from '@gleo/coord/Geometry.mjs'
  import LngLat from '@gleo/coord/LngLat.mjs'
  import epsg4326 from '@gleo/crs/epsg4326.mjs'
  import epsg3857 from '@gleo/crs/epsg3857.mjs'
  import BaseCRS from '@gleo/crs/BaseCRS.mjs'
  import '@gleo/actuators/DragActuator.mjs'
  import '@gleo/actuators/WheelActuator.mjs'
  import '@gleo/actuators/InertiaActuator.mjs'
  import proj4 from '@gleo/3rd-party/proj4js/proj4-src.js'
	import { enableProj } from '@gleo/crs/projector.mjs'


  const mapParentDiv = $ref<HTMLElement>()
  let map = $ref<GleoMap>(null)

  enableProj(proj4)
  proj4.defs(
      "EPSG:3995",
      "+proj=stere +lat_0=90 +lat_ts=71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
    )
  const epsg3995 = $ref(new BaseCRS("EPSG:3995"))

  proj4.defs(
    "LCC",
    "+proj=lcc +lat_1=43 +lat_2=62 +lat_0=30 +lon_0=10 +x_0=0 +y_0=0 +ellps=intl +units=m +no_defs"
  )
  const lcc = $ref(new BaseCRS("LCC"))

  proj4.defs(
    "sinusoidal",
    "+proj=sinu +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
  )
  const sinusoidal = $ref(new BaseCRS("sinusoidal"))

  proj4.defs(
    "mollweide",
    "+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
  )
  const mollweide = $ref(new BaseCRS("mollweide"))

  proj4.defs(
    "EPSG:25830",
    "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
  )
  const epsg25830 = $ref(new BaseCRS("EPSG:25830", { wrapPeriodY: 40000000 }))

  proj4.defs(
    "EPSG:25810",
    "+proj=utm +zone=10 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
  )
  const epsg25810 = $ref(new BaseCRS("EPSG:25810", { wrapPeriodY: 40000000 }))

  proj4.defs(
    "EPSG:25840",
    "+proj=utm +zone=50 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
  )
  const epsg25840 = $ref(new BaseCRS("EPSG:25840", { wrapPeriodY: 40000000 }))

  defineProps({
    isMinimap: {
      type: Boolean,
      default: false,
    },
  })

  function reproject(crs: BaseCRS, lnglat: Array<Number>, scale: number) {
    map.setView({ crs: crs, center: new LngLat(lnglat), scale: scale })
  }

  onMounted(() => {
    map = new GleoMap(mapParentDiv)

    map.setView({
      crs: epsg25830,
      center: new LngLat([0, 40]),
      // scale: 0.4
      scale: 20000,
    })

    fetch("./ne_110m_coastline.geojson")
      .then((response) => response.json())
      .then((json) => {
        const coastHairs = json.features.map(
          (feat) =>
            new Hair(new Geometry(epsg4326, feat.geometry.coordinates), {
              colour: "blue",
              attribution: "Natural Earth coastlines",
            })
        )

        map.multiAdd(coastHairs)

        map.redraw()
      })

    const colourRamp = [
      "#7fc97f",
      "#beaed4",
      "#fdc086",
      "#ffff99",
      "#386cb0",
      "#f0027f",
      "#bf5b17",
    ]

    fetch("./geoBoundariesCGAZ_ADM0.simplify100usr.geojson")
      .then((response) => response.json())
      .then((json) => {
        const countryFills = json.features
          .map(
            (feat) =>
              new Fill(
                new Geometry(epsg4326, feat.geometry.coordinates),
                {
                  colour: colourRamp[feat.properties.color_id - 1],
                  attribution:
                    "<a href='https://www.geoboundaries.org'>geoboundaries</a>",
                }
              )
          )

        map.multiAdd(countryFills)
        map.redraw()
      })

    const spriteopts = {
      image: "./leaflet-marker-icon.png",
      imageSize: [25, 41],
      spriteAnchor: [12, 41],
    }

    let spriteMAD = new Sprite(new LngLat([-3.6852975, 40.40197212]), spriteopts)
    let spriteTRD = new Sprite(new LngLat([10.4166662, 63.41665753]), spriteopts)
    let spriteBAS = new Sprite(
      new LngLat([-58.399477, -34.60055574]),
      spriteopts
    )

    map.multiAdd([spriteMAD, spriteTRD, spriteBAS])
    map.redraw()

    const sprites = []
    for (let x = 0; x < 359; x += 15) {
				for (let y = 70; y < 89; y += 5) {
					sprites.push(new Sprite(new LngLat([x, y]), spriteopts))
				}
			}
  })
</script>

<template>
  <div ref="mapParentDiv" style="width: 80vw; height: 80vh; display: inline-block;" :class="isMinimap ? 'minimap' : 'absolute-full'"></div>
  <div>
			<button @click="reproject(epsg4326, [0, 40], 0.2)" id="4326">4326</button>
			<button @click="reproject(epsg3857, [0, 40], 20000)" id="3857">3857</button>
			<button @click="reproject(epsg3995, [0, 40], 20000)" id="3995">3995</button>
			<button @click="reproject(lcc, [0, 40], 20000)" id="LCC">LCC</button>
			<button @click="reproject(sinusoidal, [0, 40], 20000)" id="sinusoidal">sinusoidal</button>
			<button @click="reproject(mollweide, [0, 40], 20000)" id="mollweide">mollweide</button>
			<button @click="reproject(epsg25810, [-90, 40], 20000)" id="25810">25810</button>
			<button @click="reproject(epsg25830, [0, 40], 20000)" id="25830">25830</button>
			<button @click="reproject(epsg25840, [90, 40], 20000)" id="25840">25840</button>
	</div>
</template>
