<template>
  <v-dialog :dialog="S_measureDialog" id="dialog-measure">
    <div :style="menuContentSize">
      計測もできます。
      <br>
      <b-button :pressed.sync="s_togglePoint0" class='olbtn' :size="btnSize">ポイント</b-button>
      <b-button style="margin-left: 10px;" :pressed.sync="s_toggleLine" class='olbtn' :size="btnSize">ライン</b-button>
      <b-button style="margin-left: 10px;" :pressed.sync="s_toggleMenseki" class='olbtn' :size="btnSize">ポリゴン</b-button>
      <b-button style="margin-left: 10px;" :pressed.sync="s_toggleCircle" class='olbtn' :size="btnSize">サークル</b-button>
<!--      <b-button style="margin-left: 10px;" :pressed.sync="toggleDanmen" class='olbtn' :size="btnSize">{{ toggleDanmen ? '断面図' : '断面図' }}</b-button>-->

      <!--            <b-button style="margin-top: 10px;" class='olbtn' :size="btnSize" @click="drawStop">描画ストップ</b-button>-->
<!--      <br>-->
      <b-button style="margin-top: 5px;" :pressed.sync="toggleIdou" class='olbtn' :size="btnSize">{{ toggleIdou ? '変形' : '変形' }}</b-button>
<!--      <br>-->

<!--      <b-button style="margin-top: 5px;" :pressed.sync="toggleDelete" class='olbtn' :size="btnSize">{{ toggleDelete ? '削除' : '削除' }}</b-button>-->
      <b-button style="margin-top: 5px; margin-left: 5px;" class='olbtn' :size="btnSize" @click="drawReset">全て削除</b-button>
      <hr>
      <b-button style="margin-top: 5px;" class='olbtn' :size="btnSize" @click="saveGeojson">geojson保存</b-button>
      <b-button style="margin-top: 5px;margin-left: 10px;" class='olbtn' :size="btnSize" @click="saveGpx">GPX保存</b-button>
      <b-button style="margin-top: 5px;margin-left: 10px;" class='olbtn' :size="btnSize" @click="saveKml">kml保存</b-button>

      <a id="download" download="draw.geojson"></a>
      <a id="download-gpx" download="draw.gpx"></a>
      <a id="download-kml" download="draw.kml"></a>

    </div>
  </v-dialog>
</template>

<script>
import * as MyMap from '../js/mymap'
import {drawLayer} from "@/js/mymap"
import GeoJSON from 'ol/format/GeoJSON'
import GPX from 'ol/format/GPX'
import KML from 'ol/format/KML'
import {moveEnd} from "@/js/permalink"

export default {
  name: "dialog-measure",
  data () {
    return {
      address: '',
      menuContentSize: {'height': 'auto','margin': '10px', 'overflow': 'auto', 'user-select': 'text'},
      btnSize: 'sm',
      toggle: false,
      toggleCenter: true,
      // togglePoint: false,
      // toggleLine: false,
      toggleDanmen: false,
      // toggleMenseki: false,
      // toggleCircle: false,
      toggleDelete: false,
      toggleIdou: false,
      selected: 20,
      options: [
        { value: '20', text: '20' },
        { value: '30', text: '30' },
        { value: '50', text: '50' }
      ]
    }
  },
  computed: {
    S_measureDialog () {
      return this.$store.state.base.dialogs.measureDialog
    },
    s_togglePoint0: {
      get() {
        return this.$store.state.base.togglePoint0
      },
      set(value) {
        this.$store.state.base.togglePoint0 = value
      }
    },
    s_toggleLine: {
      get() {
        return this.$store.state.base.toggleLine
      },
      set(value) {
        this.$store.state.base.toggleLine = value
      }
    },
    s_toggleMenseki: {
      get() {
        return this.$store.state.base.toggleMenseki
      },
      set(value) {
        this.$store.state.base.toggleMenseki = value
      }
    },
    s_toggleCircle: {
      get() {
        return this.$store.state.base.toggleCircle
      },
      set(value) {
        this.$store.state.base.toggleCircle = value
      }
    },
  },
  methods: {
    saveKml () {
      const features = drawLayer.getSource().getFeatures()
      const features2 = features.filter((feature) => {
        if (feature.getGeometry()) return feature.getGeometry().getType() !== 'Circle'
      })
      const drawSourceKml = new KML().writeFeatures(features2, {
        featureProjection: "EPSG:3857"
      })
      const type = "text/plain";
      const blob = new Blob([drawSourceKml], {type: type});
      const a = document.getElementById('download-kml');
      a.href = window.URL.createObjectURL(blob);
      a.click()
    },
    saveGpx () {
      const features = drawLayer.getSource().getFeatures()
      const drawSourceGpx = new GPX().writeFeatures(features, {
        featureProjection: "EPSG:3857"
      })
      const type = "text/plain";
      const blob = new Blob([drawSourceGpx], {type: type});
      const a = document.getElementById('download-gpx');
      a.href = window.URL.createObjectURL(blob);
      a.click()
    },
    saveGeojson () {
      const features = drawLayer.getSource().getFeatures()
      features.forEach(function(feature){
        if (feature.getGeometry().getType() === 'Circle') {
          const radius = feature.getGeometry().getRadius();
          const center = feature.getGeometry().getCenter();
          feature.set('radius', radius);
          feature.set('center', center);
        }
      })
      const drawSourceGeojson = new GeoJSON().writeFeatures(features, {
        featureProjection: "EPSG:3857"
      });
      const geojsonT = JSON.stringify(JSON.parse(drawSourceGeojson),null,1);
      console.log(geojsonT)
      const type = "text/plain";
      const blob = new Blob([geojsonT], {type: type});
      const a = document.getElementById('download');
      a.href = window.URL.createObjectURL(blob);
      a.click()
    },
    drawStop () {
      this.toggleLine = false
      this.togglePoint = false
      this.toggleMenseki = false
      this.toggleCircle = false
      this.toggleDelete = false
      this.toggleDanmen = false
      // this.toggleIdou = false
      this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
      this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
      this.$store.state.base.maps['map01'].removeInteraction(MyMap.circleInteraction)
      // this.$store.state.base.maps['map01'].addInteraction(MyMap.transformInteraction)
      this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)
      // this.$store.state.base.maps['map02'].addInteraction(MyMap.modifyInteraction)
    },
    drawReset () {
      const result = window.confirm('全て除しますか。');
      if( !result ) return
      this.s_toggleLine = false
      this.s_togglePoint = false
      this.s_toggleMenseki = false
      this.s_toggleCircle = false
      this.toggleDelete = false
      this.toggleDanmen = false
      this.toggleIdou = false
      MyMap.drawLayer.getSource().clear()
      // MyMap.drawLayer2.getSource().clear()
      moveEnd()
    },
    distance (){
      MyMap.addDrawInteraction(this.$store.state.base.maps['map01'])
    },
  },
  mounted () {
    // const mapName = 'map01'
    // const olPopup = document.querySelector('#' + mapName + ' .ol-popup')
    // olPopup.addEventListener('click', (e) => {
    //   if (e.target && e.target.classList.contains("edit-button")) {
    //     alert()
    //   }
    // })



    this.$watch(function () {
      return [this.toggleIdou]
    }, function () {
      if (this.toggleIdou) {
        console.log('on')
        this.s_toggleLine = false
        this.s_togglePoint = false
        this.s_toggleMenseki = false
        this.s_toggleCircle = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.pointInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.circleInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.danmenInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.transformInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)
        // this.$store.state.base.maps['map02'].addInteraction(MyMap.modifyInteraction)
      } else {
        console.log('off')
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.modifyInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.transformInteraction)
      }
    })
    this.$watch(function () {
      return [this.toggleDelete]
    }, function () {
      if (this.toggleDelete) {
        this.toggleLine = false
        this.togglePoint = false
        this.toggleMenseki = false
        this.toggleCircle = false
        this.toggleDanmen = false
        this.toggleIdou = false
        this.$store.state.base.maps['map01'].addInteraction(MyMap.selectInteraction)
        MyMap.selectInteraction.on('select', function (e) {
          const selectCollection = MyMap.selectInteraction.getFeatures();
          MyMap.drawLayer.getSource().removeFeature(selectCollection.item(0))
          //     e.target.getFeatures().getLength() +
        });
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.pointInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.circleInteraction)
      } else {
        console.log('off')
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.selectInteraction)
      }
    })
    this.$watch(function () {
      return [this.s_toggleCircle]
    }, function () {
      if (this.s_toggleCircle) {
        this.s_toggleLine = false
        this.s_togglePoint = false
        this.s_toggleMenseki = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.toggleIdou = false
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.selectInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.pointInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.circleInteraction)
        // this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)
        // this.$store.state.base.maps['map02'].addInteraction(MyMap.modifyInteraction)
        this.$store.state.base.drawType = 'circle'
      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.circleInteraction)
      }
    })
    this.$watch(function () {
      return [this.s_toggleMenseki]
    }, function () {
      if (this.s_toggleMenseki) {
        console.log(this.s_toggleMenseki)
        this.s_toggleLine = false
        this.s_togglePoint = false
        this.s_toggleCircle = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.toggleIdou = false
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.selectInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.pointInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.polygonInteraction)
        // this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)
        // this.$store.state.base.maps['map02'].addInteraction(MyMap.modifyInteraction)
        this.$store.state.base.drawType = 'menseki'

      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
      }
    })
    this.$watch(function () {
      return [this.toggleDanmen]
    }, function () {
      if (this.toggleDanmen) {
        // this.$store.state.base.maps['map01'].removeLayer(MyMap.drawLayer)
        // this.$store.state.base.maps['map01'].addLayer(MyMap.drawLayer)
        console.log('on')
        this.togglePoint = false
        this.toggleMenseki = false
        this.toggleCircle = false
        this.toggleDelete = false
        this.toggleIdou = false
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.selectInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.pointInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.danmenInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)
        // this.$store.state.base.maps['map02'].addInteraction(MyMap.modifyInteraction)
        this.$store.state.base.drawType = 'danmen'

      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.danmenInteraction)
      }
    })
    this.$watch(function () {
      return [this.s_toggleLine]
    }, function () {
      if (this.s_toggleLine) {
        // this.$store.state.base.maps['map01'].removeLayer(MyMap.drawLayer)
        // this.$store.state.base.maps['map01'].addLayer(MyMap.drawLayer)
        console.log('on')

        this.s_togglePoint = false
        this.s_toggleMenseki = false
        this.s_toggleCircle = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.toggleIdou = false
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.selectInteraction)
        // this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.pointInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.lineInteraction)
        // this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)
        // this.$store.state.base.maps['map02'].addInteraction(MyMap.modifyInteraction)
        this.$store.state.base.drawType = 'line'

      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
      }
    })
    this.$watch(function () {
      return [this.s_togglePoint0]
    }, function () {
      if (this.s_togglePoint0) {
        // this.$store.state.base.maps['map01'].removeLayer(MyMap.drawLayer)
        // this.$store.state.base.maps['map01'].addLayer(MyMap.drawLayer)
        console.log('on')
        // alert()
        this.s_toggleLine = false
        this.s_toggleMenseki = false
        this.s_toggleCircle = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.toggleIdou = false
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.selectInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.pointInteraction)
        // this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)
        // this.$store.state.base.maps['map02'].addInteraction(MyMap.modifyInteraction)
        this.$store.state.base.drawType = 'point'

      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.pointInteraction)
      }
    })
  }
}
</script>

<style scoped>
.shortUrl-div{
  margin-top: 10px;
  padding: 5px;
  border: solid 1px gray;
  height: 36px;
}
.olbtn{
  background-color: rgba(0,60,136,0.5);
}
.btn-secondary:hover{
  background-color: rgba(0,60,136,0.7);
}
</style>
