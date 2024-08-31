<template>
  <v-dialog :dialog="S_measureDialog" id="dialog-measure">
    <div :style="menuContentSize">
      <b-form-checkbox style="margin-bottom: 10px;" v-model="s_toggleIdo" name="check-button" switch>
        変形＆移動モード
      </b-form-checkbox>
      <b-button :pressed.sync="s_togglePoint0" class='olbtn' :size="btnSize">点</b-button>
      <b-button style="margin-left: 5px;" :pressed.sync="s_toggleLine" class='olbtn' :size="btnSize">線</b-button>
      <b-button style="margin-left: 5px;" :pressed.sync="s_toggleFreeHand" class='olbtn' :size="btnSize">フリー</b-button>
      <b-button style="margin-left: 5px;" :pressed.sync="s_toggleMenseki" class='olbtn' :size="btnSize">ポリゴン</b-button>
      <b-button style="margin-left: 5px;" :pressed.sync="s_toggleShikaku" class='olbtn' :size="btnSize">四角</b-button>
      <b-button style="margin-left: 5px;" :pressed.sync="s_toggleCircle" class='olbtn' :size="btnSize">円</b-button>
      <b-button style="margin-left: 5px;" :pressed.sync="s_toggleDaen" class='olbtn' :size="btnSize">楕円</b-button>
<!--      <b-button style="margin-left: 5px;" :pressed.sync="s_toggleText" class='olbtn' :size="btnSize">文字</b-button>-->
<!--      <b-button style="margin-left: 10px;" :pressed.sync="toggleDanmen" class='olbtn' :size="btnSize">{{ toggleDanmen ? '断面図' : '断面図' }}</b-button>-->
      <br>
      <!--            <b-button style="margin-top: 10px;" class='olbtn' :size="btnSize" @click="drawStop">描画ストップ</b-button>-->
<!--      <br>-->
<!--      <b-button style="margin-top: 5px;color: red;" :pressed.sync="s_toggleIdo" class='olbtn' :size="btnSize">変形&移動</b-button>-->
      <b-button style="margin-top: 5px; margin-left: 0px;" class='olbtn' :size="btnSize" @click="drawReset">削除</b-button>
      <b-button style="margin-top: 5px; margin-left: 5px;" class='olbtn' :size="btnSize" @click="drawAllReset">全て削除</b-button>
      <b-button style="margin-top: 5px; margin-left: 5px;" class='olbtn' :size="btnSize" @click="drawCopy">コピー</b-button>
      <b-button style="margin-top: 5px; margin-left: 5px;" class='olbtn' :size="btnSize" @click="drawUndo">戻す</b-button>
      <b-button style="margin-top: 5px; margin-left: 5px;" class='olbtn' :size="btnSize" @click="drawRedo">やり直す</b-button>
      <br>
      <b-button style="margin-top: 5px; margin-left: 0px;" class='olbtn' :size="btnSize" @click="drawKodo">高度編集</b-button>

      <div class="kodo" v-if="kodo">
        <input type='number' value="0.001" step="0.0005" v-model="tolerance" style="width: 100px;margin-top: 0px;">
        <b-button style="margin-top: 0px; margin-left: 2px;" class='olbtn' :size="btnSize" @click="drawSinple">線、ポリゴンをシンプル化</b-button>
      </div>

      <div class="range-div">
        <label class="eye-label">
          <input type="checkbox" class='checkbox' checked v-model="s_drawVisible">
          <span class="checkbox-eye"></span>
        </label>
        <input type="range" min="0" max="1" step="0.01" class="range" v-model="s_drawOpacity" />
        <b-form-checkbox class="check-measure" v-model="s_drawMeasure" name="check-button" switch>
          計測
        </b-form-checkbox>
      </div>

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
import * as permalink from "@/js/permalink";
import store from "@/js/store";
import * as turf from '@turf/turf';
import {transform} from "ol/proj";
import {LineString,Polygon} from "ol/geom";
import Feature from "ol/Feature";
import {measure} from "../js/mymap";

export default {
  name: "dialog-measure",
  data () {
    return {
      address: '',
      menuContentSize: {'height': 'auto','margin': '10px', 'overflow': 'auto', 'user-select': 'text'},
      btnSize: 'sm',
      toggle: false,
      toggleCenter: true,
      toggleDanmen: false,
      toggleDelete: false,
      selected: 20,
      options: [
        { value: '20', text: '20' },
        { value: '30', text: '30' },
        { value: '50', text: '50' }
      ],
      kodo: false,
      tolerance: 0.001
    }
  },
  computed: {
    s_drawMeasure: {
      get() {
        return this.$store.state.base.drawMeasure
      },
      set(value) {
        this.$store.state.base.drawMeasure = value
      }
    },
    S_measureDialog () {
      return this.$store.state.base.dialogs.measureDialog
    },
    s_drawVisible: {
      get() {
        return this.$store.state.base.drawVisible
      },
      set(value) {
        this.$store.state.base.drawVisible = value
      }
    },
    s_drawOpacity: {
      get() {
        return this.$store.state.base.drawOpacity
      },
      set(value) {
        this.$store.state.base.drawOpacity = value
      }
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
    s_toggleFreeHand: {
      get() {
        return this.$store.state.base.toggleFreeHand
      },
      set(value) {
        this.$store.state.base.toggleFreeHand = value
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
    s_toggleShikaku: {
      get() {
        return this.$store.state.base.toggleShikaku
      },
      set(value) {
        this.$store.state.base.toggleShikaku = value
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
    s_toggleDaen: {
      get() {
        return this.$store.state.base.toggleDaen
      },
      set(value) {
        this.$store.state.base.toggleDaen = value
      }
    },
    s_toggleText: {
      get() {
        return this.$store.state.base.toggleText
      },
      set(value) {
        this.$store.state.base.toggleText = value
      }
    },
    s_toggleIdo: {
      get() {
        return this.$store.state.base.toggleIdo
      },
      set(value) {
        this.$store.state.base.toggleIdo = value
      }
    },
  },
  methods: {
    toggleReset () {
      this.s_toggleCircle = false
      this.s_togglePoint = false
      this.s_togglePoint0 = false
      this.s_toggleLine = false
      this.s_toggleFreeHand = false
      this.s_togglePoint = false
      this.s_toggleMenseki = false
      this.s_toggleDaen = false
      this.s_toggleShikaku = false
      this.toggleDelete = false
      this.toggleDanmen = false
      this.s_toggleIdo = false
    },
    drawKodo () {
      this.kodo = !this.kodo
    },
    drawSinple () {
      const targetFeature = this.$store.state.base.editFeature
      if (!targetFeature) {
        alert('選択されていません。')
        return
      }
      if (targetFeature.getGeometry().getType() !== 'LineString' && targetFeature.getGeometry().getType() !== 'Polygon') {
        alert('線又はポリゴンではありません。')
        return
      }
      const fiatureGeojson = new GeoJSON().writeFeatures([targetFeature], {
        featureProjection: "EPSG:3857"
      })
      const features = JSON.parse(fiatureGeojson).features
      console.log(features)
      //0.001
      const sinpleFeature = turf.simplify(features[0], { tolerance: this.tolerance, highQuality: false })
      console.log(sinpleFeature)
      let coordinates = []
      let polygonCoordinates = []
      let newFeature
      if (targetFeature.getGeometry().getType() === 'LineString') {
        sinpleFeature.geometry.coordinates.forEach((coord) => {
          coordinates.push(transform(coord, "EPSG:4326", "EPSG:3857"))
        })
        const lineString = new LineString(coordinates)
        newFeature = new Feature(lineString)
      } else {
        sinpleFeature.geometry.coordinates[0].forEach((coord) => {
          polygonCoordinates.push(transform(coord, "EPSG:4326", "EPSG:3857"))
        })
        const polygon = new Polygon([polygonCoordinates])
        newFeature = new Feature(polygon)
      }
      if (targetFeature.values_) {
        Object.keys(targetFeature.values_).forEach(function (key) {
          if (key !== 'geometry') newFeature.setProperties({[key]: targetFeature.values_[key]})
        })
      }

      MyMap.drawLayer.getSource().removeFeature(targetFeature)
      MyMap.drawLayer.getSource().addFeature(newFeature)

      const coordAr = newFeature.getGeometry().getCoordinates()
      const geoType = newFeature.getGeometry().getType()
      measure (geoType,newFeature,coordAr)

      this.$store.state.base.editFeature = null

    },
    drawCopy () {
      if (!this.s_toggleIdo) {
        alert('「変形＆移動」モードにして線、ポリゴン等を選択後にコピーしてください。')
        return
      }
      // transformInteraction.select(this.$store.state.base.editFeature, true)
      MyMap.copyInteraction.copy({ silent: false })
      this.$store.state.base.maps['map01'].removeInteraction(MyMap.transformInteraction)
      this.$store.state.base.maps['map01'].addInteraction(MyMap.transformInteraction)
      MyMap.copyInteraction.paste({ silent: false })

    },
    drawRedo () {
      MyMap.undoInteraction.redo()
    },
    drawUndo () {
      MyMap.undoInteraction.undo()
    },
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
      this.toggleIdo = false
      this.$store.state.base.maps['map01'].removeInteraction(MyMap.lineInteraction)
      this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
      this.$store.state.base.maps['map01'].removeInteraction(MyMap.circleInteraction)
      // this.$store.state.base.maps['map01'].addInteraction(MyMap.transformInteraction)
      this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)
      // this.$store.state.base.maps['map02'].addInteraction(MyMap.modifyInteraction)
    },
    drawReset () {

      this.s_togglePoint0 = false
      this.s_toggleLine = false
      this.s_toggleFreeHand = false
      this.s_togglePoint = false
      this.s_toggleMenseki = false
      this.s_toggleCircle = false
      this.s_toggleDaen = false
      this.s_toggleShikaku = false
      this.toggleDelete = false
      this.toggleDanmen = false

      drawLayer.getSource().removeFeature(store.state.base.editFeature)
      const tFeatures = MyMap.transformInteraction.getFeatures().array_
      tFeatures.forEach((feature) => {
        drawLayer.getSource().removeFeature(feature)
      })
      MyMap.overlay['0'].setPosition(undefined)
      moveEnd()
    },
    drawAllReset () {
      const result = window.confirm('全て削除しますか。');
      if( !result ) return
      this.s_togglePoint0 = false
      this.s_toggleLine = false
      this.s_toggleFreeHand = false
      this.s_togglePoint = false
      this.s_toggleMenseki = false
      this.s_toggleCircle = false
      this.s_toggleDaen = false
      this.s_toggleShikaku = false
      this.toggleDelete = false
      this.toggleDanmen = false
      this.s_toggleIdo = false
      MyMap.drawLayer.getSource().clear()
      // MyMap.drawLayer2.getSource().clear()
      moveEnd()
    },
  },
  watch: {
    s_drawOpacity(newValue) {
      MyMap.drawLayer.setOpacity(Number(newValue))
      permalink.moveEnd()
    },
    s_drawVisible(newValue) {
      MyMap.drawLayer.setVisible(Number(newValue))
      permalink.moveEnd()
    }
  },
  mounted () {

    const dragHandle = document.querySelector('#dialog-measure .drag-handle');
    dragHandle.innerHTML = ''


    this.$watch(function () {
      return [this.s_toggleIdo]
    }, function () {
      if (this.s_toggleIdo) {
        console.log('on')
        this.s_togglePoint0 = false
        this.s_toggleLine = false
        this.s_toggleFreeHand = false
        this.s_togglePoint = false
        this.s_toggleMenseki = false
        this.s_toggleCircle = false
        this.s_toggleDaen = false
        this.s_toggleShikaku = false
        this.toggleDelete = false
        this.toggleDanmen = false

        this.$store.state.base.maps['map01'].addInteraction(MyMap.transformInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)

        dragHandle.innerHTML = '<span style="color: red;">変形&移動モード中</span>'
        MyMap.transformInteraction.select(this.$store.state.base.editFeature, true)

      } else {
        console.log('off')
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.modifyInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.transformInteraction)

        dragHandle.innerHTML = ''

      }
    })
    this.$watch(function () {
      return [this.toggleDelete]
    }, function () {
      if (this.toggleDelete) {
        this.s_togglePoint0 = false
        this.s_toggleLine = false
        this.s_toggleFreeHand = false
        this.s_togglePoint = false
        this.s_toggleMenseki = false
        this.s_toggleCircle = false
        this.s_toggleDaen = false
        this.s_toggleShikaku = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.s_toggleIdo = false
        this.$store.state.base.maps['map01'].addInteraction(MyMap.selectInteraction)
        MyMap.selectInteraction.on('select', function (e) {
          const selectCollection = MyMap.selectInteraction.getFeatures();
          MyMap.drawLayer.getSource().removeFeature(selectCollection.item(0))
          //     e.target.getFeatures().getLength() +
        });
      } else {
        console.log('off')
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.selectInteraction)
      }
    })
    this.$watch(function () {
      return [this.s_toggleCircle]
    }, function () {
      if (this.s_toggleCircle) {
        this.s_togglePoint0 = false
        this.s_toggleLine = false
        this.s_toggleFreeHand = false
        this.s_togglePoint = false
        this.s_toggleMenseki = false
        this.s_toggleDaen = false
        this.s_toggleShikaku = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.s_toggleIdo = false
        this.$store.state.base.maps['map01'].addInteraction(MyMap.circleInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.modifyInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.transformInteraction)

        this.$store.state.base.drawType = 'circle'
      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.circleInteraction)
      }
    })
    this.$watch(function () {
      return [this.s_toggleDaen]
    }, function () {
      if (this.s_toggleDaen) {
        this.s_togglePoint0 = false
        this.s_toggleLine = false
        this.s_toggleFreeHand = false
        this.s_togglePoint = false
        this.s_toggleMenseki = false
        this.s_toggleCircle = false
        this.s_toggleShikaku = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.s_toggleIdo = false
        this.$store.state.base.maps['map01'].addInteraction(MyMap.daenInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.modifyInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.transformInteraction)

        this.$store.state.base.drawType = 'circle'
      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.daenInteraction)
      }
    })
    this.$watch(function () {
      return [this.s_toggleMenseki]
    }, function () {
      if (this.s_toggleMenseki) {
        this.s_toggleLine = false
        this.s_toggleFreeHand = false
        this.s_toggleShikaku = false
        this.s_togglePoint = false
        this.s_toggleCircle = false
        this.s_toggleDaen = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.s_toggleIdo = false
        this.$store.state.base.maps['map01'].addInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.snapnteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.modifyInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.transformInteraction)
        this.$store.state.base.drawType = 'menseki'

      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.polygonInteraction)
      }
    })
    this.$watch(function () {
      return [this.s_toggleShikaku]
    }, function () {
      if (this.s_toggleShikaku) {
        this.s_togglePoint0 = false
        this.s_toggleLine = false
        this.s_toggleFreeHand = false
        this.s_togglePoint = false
        this.s_toggleMenseki = false
        this.s_toggleCircle = false
        this.s_toggleDaen = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.s_toggleIdo = false
        this.$store.state.base.maps['map01'].addInteraction(MyMap.regularInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.modifyInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.transformInteraction)
        this.$store.state.base.drawType = 'menseki'

      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.regularInteraction)
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
        this.s_toggleShikaku = false
        this.toggleCircle = false
        this.toggleDelete = false
        this.s_toggleIdo = false
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
        console.log('on')
        this.s_togglePoint0 = false
        this.s_toggleFreeHand = false
        this.s_togglePoint = false
        this.s_toggleMenseki = false
        this.s_toggleCircle = false
        this.s_toggleDaen = false
        this.s_toggleShikaku = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.s_toggleIdo = false
        this.$store.state.base.maps['map01'].addInteraction(MyMap.lineInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.modifyInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.transformInteraction)
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
      return [this.s_toggleFreeHand]
    }, function () {
      if (this.s_toggleFreeHand) {
        // this.$store.state.base.maps['map01'].removeLayer(MyMap.drawLayer)
        // this.$store.state.base.maps['map01'].addLayer(MyMap.drawLayer)
        console.log('on')
        this.s_togglePoint0 = false
        this.s_toggleLine = false
        this.s_togglePoint = false
        this.s_toggleMenseki = false
        this.s_toggleCircle = false
        this.s_toggleDaen = false
        this.s_toggleShikaku = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.s_toggleIdo = false
        this.$store.state.base.maps['map01'].addInteraction(MyMap.freeHandInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.modifyInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.transformInteraction)

        this.$store.state.base.drawType = 'line'

      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.freeHandInteraction)
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
        this.s_toggleFreeHand = false
        this.s_togglePoint = false
        this.s_toggleMenseki = false
        this.s_toggleCircle = false
        this.s_toggleDaen = false
        this.s_toggleDaen = false
        this.s_toggleShikaku = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.s_toggleIdo = false
        this.$store.state.base.maps['map01'].addInteraction(MyMap.pointInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.modifyInteraction)
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.transformInteraction)
        this.$store.state.base.drawType = 'point'
      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.pointInteraction)
      }
    })
    this.$watch(function () {
      return [this.s_drawMeasure]
    }, function () {
      MyMap.drawLayer.getSource().changed()
      permalink.moveEnd()
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
.range-div {
  margin-top: 5px;
  position: relative;
}
.range {
  width: 200px;
  margin-left: 40px;
}
.eye-label {
  position: absolute;
  top:0px;
  left:5px;
  width:30px;
  color:rgba(0,60,136,0.5);
  cursor: pointer;
}
.checkbox {
  display: none;
}
.checkbox-eye {
  position: relative;
  vertical-align: middle;
  font-size: 20px;
}
.checkbox + .checkbox-eye:before {
  font-weight: 550;
  font-family: "Font Awesome 5 Free";
  content: '\f070';
  color:rgba(0,60,136,0.5);
  cursor: pointer;
}
.checkbox:checked + .checkbox-eye:before {
  font-weight: 550;
  font-family: "Font Awesome 5 Free";
  content: '\f06e';
  color:rgba(0,60,136,0.5);

}
.checkbox-eye:hover:before{
  color: blue;
}
.checkbox:checked + .checkbox-eye:hover:before {
  color: blue;
}
.check-measure {
  position: absolute;
  left:250px;
  top:0;
}
.kodo {
  margin-top: 5px;
  padding: 10px;
  border: 1px solid darkgray;
}
</style>
