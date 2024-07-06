<template>
  <v-dialog :dialog="S_measureDialog">
    <div :style="menuContentSize">
      計測
      <br>
      <b-button :pressed.sync="toggleLine" class='olbtn' :size="btnSize">{{ toggleLine ? '距離計測' : '距離計測' }}</b-button>
      <b-button style="margin-left: 10px;" :pressed.sync="toggleMenseki" class='olbtn' :size="btnSize">{{ toggleMenseki ? '面積計測' : '面積計測' }}</b-button>
      <b-button style="margin-left: 10px;" :pressed.sync="toggleCircle" class='olbtn' :size="btnSize">{{ toggleCircle ? '円描画' : '円描画' }}</b-button>
      <b-button style="margin-left: 10px;" :pressed.sync="toggleDanmen" class='olbtn' :size="btnSize">{{ toggleDanmen ? '断面図' : '断面図' }}</b-button>

      <!--            <b-button style="margin-top: 10px;" class='olbtn' :size="btnSize" @click="drawStop">描画ストップ</b-button>-->
      <br>
      <b-button style="margin-top: 5px;" :pressed.sync="toggleIdou" class='olbtn' :size="btnSize">{{ toggleIdou ? '移動' : '描画ストップ&移動' }}</b-button>
      <br>

      <b-button style="margin-top: 5px;" :pressed.sync="toggleDelete" class='olbtn' :size="btnSize">{{ toggleDelete ? '削除' : '削除' }}</b-button>
      <b-button style="margin-top: 5px; margin-left: 10px;" class='olbtn' :size="btnSize" @click="drawReset">クリア</b-button>
      <b-button style="margin-top: 5px;margin-left: 10px;" class='olbtn' :size="btnSize" @click="saveGeojson">geojson保存</b-button>

      <a id="download" download="draw.geojson"></a>

    </div>
  </v-dialog>
</template>

<script>
import * as MyMap from '../js/mymap'
import {drawLayer} from "../js/mymap";
import {GeoJSON} from 'ol/format.js';
import {moveEnd} from "../js/permalink";

export default {
  name: "dialog-measure",
  data () {
    return {
      address: '',
      menuContentSize: {'height': 'auto','margin': '10px', 'overflow': 'auto', 'user-select': 'text'},
      btnSize: 'sm',
      toggle: false,
      toggleCenter: true,
      toggleLine: false,
      toggleDanmen: false,
      toggleMenseki: false,
      toggleCircle: false,
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
    }
  },
  methods: {
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
      this.toggleLine = false
      this.toggleMenseki = false
      this.toggleCircle = false
      this.toggleDelete = false
      this.toggleDanmen = false
      this.toggleIdou = false
      MyMap.drawLayer.getSource().clear()
      moveEnd()
    },
    distance (){
      MyMap.addDrawInteraction(this.$store.state.base.maps['map01'])
    },
  },
  mounted () {
    this.$watch(function () {
      return [this.toggleIdou]
    }, function () {
      if (this.toggleIdou) {
        console.log('on')
        this.toggleLine = false
        this.toggleMenseki = false
        this.toggleCircle = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.circleInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.danmenInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.transformInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)
        // this.$store.state.base.maps['map02'].addInteraction(MyMap.modifyInteraction)
      } else {
        console.log('off')
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.transformInteraction)
      }
    })
    this.$watch(function () {
      return [this.toggleDelete]
    }, function () {
      if (this.toggleDelete) {
        this.toggleLine = false
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
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.circleInteraction)
      } else {
        console.log('off')
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.selectInteraction)
      }
    })
    this.$watch(function () {
      return [this.toggleCircle]
    }, function () {
      if (this.toggleCircle) {
        this.toggleLine = false
        this.toggleMenseki = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.toggleIdou = false
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.selectInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.circleInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)
        // this.$store.state.base.maps['map02'].addInteraction(MyMap.modifyInteraction)
        this.$store.state.base.drawType = 'circle'
      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.circleInteraction)
      }
    })
    this.$watch(function () {
      return [this.toggleMenseki]
    }, function () {
      if (this.toggleMenseki) {
        console.log(this.toggleMenseki)
        this.toggleLine = false
        this.toggleCircle = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.toggleIdou = false
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.selectInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)
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
        this.toggleMenseki = false
        this.toggleCircle = false
        this.toggleDelete = false
        this.toggleIdou = false
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.selectInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
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
      return [this.toggleLine]
    }, function () {
      if (this.toggleLine) {
        // this.$store.state.base.maps['map01'].removeLayer(MyMap.drawLayer)
        // this.$store.state.base.maps['map01'].addLayer(MyMap.drawLayer)
        console.log('on')
        this.toggleMenseki = false
        this.toggleCircle = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.toggleIdou = false
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.selectInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.lineInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)
        // this.$store.state.base.maps['map02'].addInteraction(MyMap.modifyInteraction)
        this.$store.state.base.drawType = 'line'

      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
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
