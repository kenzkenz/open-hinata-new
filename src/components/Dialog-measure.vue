<template>
  <v-dialog :dialog="S_measureDialog" id="dialog-measure">
    <div :style="menuContentSize">
      <b-form-radio-group style="margin-bottom: 10px"
          v-model="s_drawMode"
          :options="options"
          name="radio-inline"
      ></b-form-radio-group>
<!--      <b-form-checkbox style="margin-bottom: 10px;" v-model="s_toggleText" name="check-button" switch>-->
<!--        選択-->
<!--      </b-form-checkbox>-->
<!--      <b-form-checkbox style="margin-bottom: 10px;top:0;margin-left:90px" v-model="s_toggleIdo" name="check-button" switch>-->
<!--        変形-->
<!--      </b-form-checkbox>-->
<!--      <b-form-checkbox style="margin-bottom: 10px;top:0;margin-left: 180px" v-model="s_toggleIdo2" name="check-button" switch>-->
<!--        移動,拡大-->
<!--      </b-form-checkbox>-->
      <b-button :pressed.sync="s_togglePoint0" class='olbtn' :size="btnSize">点</b-button>
      <b-button style="margin-left: 5px;" :pressed.sync="s_toggleLine" class='olbtn' :size="btnSize">線</b-button>
      <b-button style="margin-left: 5px;" :pressed.sync="s_toggleFreeHand" class='olbtn' :size="btnSize">フリー</b-button>
      <b-button style="margin-left: 5px;" :pressed.sync="s_toggleMenseki" class='olbtn' :size="btnSize">ポリゴン</b-button>
      <b-button style="margin-left: 5px;" :pressed.sync="s_toggleShikaku" class='olbtn' :size="btnSize">四角</b-button>
      <b-button style="margin-left: 5px;" :pressed.sync="s_toggleCircle" class='olbtn' :size="btnSize">円</b-button>
      <b-button style="margin-left: 5px;" :pressed.sync="s_toggleDaen" class='olbtn' :size="btnSize">楕円</b-button>
      <br>
      <b-button style="margin-top: 5px; margin-left: 0px;" :pressed.sync="s_toggleHole" class='olbtn' :size="btnSize">穴をあける</b-button>
      <b-button id="color-btn0" style="margin-top: 5px; margin-left: 5px;" class='olbtn' :size="btnSize" @click="openDialog">色</b-button>
      <b-button style="margin-top: 5px; margin-left: 5px;" class='olbtn' :size="btnSize" @click="drawTrack">トラッキング</b-button>

      <!--      <b-button style="margin-left: 10px;" :pressed.sync="toggleDanmen" class='olbtn' :size="btnSize">{{ toggleDanmen ? '断面図' : '断面図' }}</b-button>-->
      <br>
      <b-button style="margin-top: 5px; margin-left: 0px;" class='olbtn' :size="btnSize" @click="drawReset">削除</b-button>
      <b-button style="margin-top: 5px; margin-left: 5px;" class='olbtn' :size="btnSize" @click="drawAllReset">全て削除</b-button>
      <b-button style="margin-top: 5px; margin-left: 5px;" class='olbtn' :size="btnSize" @click="drawCopy">コピー</b-button>
      <b-button style="margin-top: 5px; margin-left: 5px;" class='olbtn' :size="btnSize" @click="drawUndo">戻す</b-button>
      <b-button style="margin-top: 5px; margin-left: 5px;" class='olbtn' :size="btnSize" @click="drawRedo">やり直す</b-button>
      <br>
      <div style="position: relative">
        <b-button style="margin-top: 5px; margin-left: 0px;" class='olbtn' :size="btnSize" @click="drawKodo">高度編集</b-button>
        <b-button style="margin-top: 5px;margin-left: 5px;" class='olbtn' :size="btnSize" @click="openDialog2">geojson編集</b-button>
        <b-form-checkbox style="margin-top: 10px;position: absolute;top:0;margin-left:180px" v-model="s_toggleVertex" name="check-button" switch>
          頂点を表示
        </b-form-checkbox>
      </div>
      <div class="kodo" v-if="kodo">
        <input type='number' value="0.001" step="0.0005" v-model="tolerance" style="width: 100px;margin-top: 0px;">
        <b-button style="margin-top: 0px; margin-left: 2px;" class='olbtn' :size="btnSize" @click="drawSinple">線、ポリゴンをシンプル化</b-button>
        <b-button style="margin-top: 5px; margin-left: 0px;" class='olbtn' :size="btnSize" @click="drawBezier">線を滑らかにする（ベジェ曲線）</b-button>
        <b-button style="margin-top: 5px; margin-left: 0px;margin-bottom: 5px;" class='olbtn' :size="btnSize" @click="drawPolygonSmooth">ポリゴンをスムーズにする</b-button>
        <b-button style="margin-left: 5px;" :pressed.sync="s_toggleSplit" class='olbtn' :size="btnSize">線を分割する</b-button>

        <br><input type='number' value="0" step="0.1" v-model="radius" style="width: 100px;margin-top: 0px;">
        <b-button style="margin-top: 0px; margin-left: 2px;" class='olbtn' :size="btnSize" @click="drawBuffer">バッファー</b-button>
        <br>
        <div style="position: relative;">
          <b-form-checkbox style="margin-bottom: 10px;position: absolute;top:10px;left: 0;" v-model="voronoiColor" name="check-button" switch>
            色
          </b-form-checkbox>
          <b-button style="margin-top: 5px; margin-left: 60px;" class='olbtn' :size="btnSize" @click="drawVoronoi">ボロノイ図</b-button>
          <b-button style="margin-top: 5px; margin-left: 5px;" class='olbtn' :size="btnSize" @click="drawHeatMap">ヒートマップ</b-button>
        </div>

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
      <b-button style="margin-top: 5px;" class='olbtn' :size="btnSize" @click="saveGeojson">geojson</b-button>
      <b-button style="margin-top: 5px;margin-left: 5px;" class='olbtn' :size="btnSize" @click="saveGpx">GPX</b-button>
      <b-button style="margin-top: 5px;margin-left: 5px;" class='olbtn' :size="btnSize" @click="saveKml">kml</b-button>
      <b-button style="margin-top: 5px;margin-left: 5px;" class='olbtn' :size="btnSize" @click="saveCsv">csv</b-button>

      <form id="load_form" style="display: none">
        <input id="load_form_input" type="file" name="file_" accept=".geojson,.kml,.gpx,.csv" @change="file_upload()">
      </form>
      <b-button style="margin-top: 5px;margin-left: 5px;" class='olbtn' size="sm" @click="upLoad">読み込み</b-button>

      <a id="download" download="draw.geojson"></a>
      <a id="download-gpx" download="draw.gpx"></a>
      <a id="download-kml" download="draw.kml"></a>
      <a id="download-csv" download="draw.csv"></a>

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
import {Circle, LineString, MultiLineString, MultiPolygon, Point, Polygon} from "ol/geom";
import Feature from "ol/Feature";
import {measure} from "../js/mymap";
import * as d3 from "d3";
import {parse} from 'csv-parse/lib/sync'


export default {
  name: "dialog-measure",
  components: {
  },
  data () {
    return {
      selected: 'sentaku',
      options: [
        { text: '選択', value: 'sentaku' },
        { text: '変形', value: 'henkei' },
        { text: '移動・拡大', value: 'ido' }
      ],
      address: '',
      menuContentSize: {'height': 'auto','margin': '10px', 'overflow': 'auto', 'user-select': 'text', 'position': 'relative'},
      btnSize: 'sm',
      toggle: false,
      toggleCenter: true,
      toggleDanmen: false,
      toggleDelete: false,
      kodo: false,
      tolerance: 0.001,
      radius: 0,
      voronoiColor: true,
    }
  },
  computed: {
    s_drawMode: {
      get() {
        return this.$store.state.base.drawMode
      },
      set(value) {
        this.$store.state.base.drawMode = value
      }
    },
    s_dialogMaxZindex () { return this.$store.state.base.dialogMaxZindex},
    s_dialogs () { return this.$store.state.base.dialogs},
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
    s_toggleHole: {
      get() {
        return this.$store.state.base.toggleHole
      },
      set(value) {
        this.$store.state.base.toggleHole = value
      }
    },
    s_toggleSplit: {
      get() {
        return this.$store.state.base.toggleSplit
      },
      set(value) {
        this.$store.state.base.toggleSplit = value
      }
    },
    s_toggleVertex: {
      get() {
        return this.$store.state.base.toggleVertex
      },
      set(value) {
        this.$store.state.base.toggleVertex = value
        MyMap.drawLayer.getSource().changed()
      }
    },
  },
  methods: {
    drawTrack () {
      const dialog = this.$store.state.base.dialogs.dialogTrack
      if (dialog.style.display === 'block') {
        dialog.style.display = 'none'
      } else {
        this.$store.commit('base/incrDialogMaxZindex')
        dialog.style["z-index"] = this.s_dialogMaxZindex
        dialog.style.display = 'block'
      }
    },
    upLoad (){
      document.getElementById("load_form_input").click();
    },
    file_upload() {
      const vm = this
      document.querySelector('#map01 .loadingImg').style.display = 'block'
      const [file] = document.getElementById("load_form_input").files
      const extension = file.name.split('.')[1]
      const reader = new FileReader()
      reader.addEventListener(
          "load",
          () => {
            aaa(extension,reader.result)
          },
          false,
      )
      if (file) {
        reader.readAsText(file);
      }

      function aaa (extension,text) {
        let features = []
        if (extension === 'geojson') {
          features = new GeoJSON({
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
          }).readFeatures(JSON.parse(text))
          MyMap.undoInteraction.blockStart()
          MyMap.drawLayer.getSource().clear()
          MyMap.drawLayer.getSource().addFeatures(features)
        } else if (extension === 'kml') {
          features = new KML({
          }).readFeatures(text,{
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
          })
          const geojson = new GeoJSON().writeFeatures(features, {
            featureProjection: "EPSG:3857"
          })
          const geojsonFeatures = new GeoJSON({
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
          }).readFeatures(geojson)
          MyMap.undoInteraction.blockStart()
          MyMap.drawLayer.getSource().clear()
          MyMap.drawLayer.getSource().addFeatures(geojsonFeatures)
        } else if (extension === 'gpx') {
          features = new GPX({
          }).readFeatures(text,{
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
          })
          MyMap.undoInteraction.blockStart()
          MyMap.drawLayer.getSource().clear()
          MyMap.drawLayer.getSource().addFeatures(features)
        } else if (extension === 'csv') {
          MyMap.undoInteraction.blockStart()
          const records = parse(text, { columns: true})
          let newFeature
          records.forEach((row) => {
            if (row.geoType === 'Point') {
              const coordinates = transform([row.経度, row.緯度], "EPSG:4326", "EPSG:3857")
              const point = new Point(coordinates)
              newFeature = new Feature(point)
            } else if (row.geoType === 'LineString') {
              let coordinates = []
              JSON.parse(row.coords).forEach((coord) => {
                coordinates.push(transform(coord, "EPSG:4326", "EPSG:3857"))
              })
              const lineString = new LineString(coordinates)
              newFeature = new Feature(lineString)
            } else if (row.geoType === 'Polygon') {
              let coordinates = []
              JSON.parse(row.coords).forEach((coords,i) => {
                coordinates.push([])
                coords.forEach((coord) => {
                  coordinates[i].push(transform(coord, "EPSG:4326", "EPSG:3857"))
                })
              })
              const polygon = new Polygon(coordinates)
              newFeature = new Feature(polygon)
            } else if (row.geoType === 'MultiPolygon') {
              let coordinates = []
              JSON.parse(row.coords).forEach((coords,i) => {
                coordinates.push([])
                coords.forEach((coord,ii) => {
                  coordinates[i].push([])
                  coord.forEach((c) => {
                    coordinates[i][ii].push(transform(c, "EPSG:4326", "EPSG:3857"))
                  })
                })
              })
              const multiPolygon = new MultiPolygon(coordinates)
              newFeature = new Feature(multiPolygon)
            } else if (row.geoType === 'GeometryCollection') {
              console.log(row.center, row.radius)
              const circle = new Circle(JSON.parse(row.center), Number(row.radius))
              newFeature = new Feature(circle)
            }
            newFeature.setProperties({
                  'name': row.名称,
                  'description': row.説明,
                  '_color': row.色,
                  '_fillColor': row.塗りつぶし色,
                  '_distance': row.距離,
                  '_area': row.面積,
                }
            )
            MyMap.drawLayer.getSource().addFeature(newFeature)
          })
        }
        features.forEach((feature) =>{
          if (feature.getGeometry().getType() === 'GeometryCollection') {
            drawLayer.getSource().removeFeature(feature)
            const circle = new Circle(feature.get('center'), feature.get('radius'));
            const newFeature = new Feature(circle);
            newFeature.setProperties({
              name: feature.getProperties().name,
              setumei: feature.getProperties().setumei,
              _fillColor: feature.getProperties()._fillColor,
              _distance: feature.getProperties()._distance,
              _area: feature.getProperties()._area
            })
            drawLayer.getSource().addFeature(newFeature)
            moveEnd()
          }
        })
        MyMap.undoInteraction.blockEnd()
        vm.$store.state.base.maps['map01'].getView().fit(drawLayer.getSource().getExtent(),{padding: [100, 100, 100, 100]})
        document.querySelector('#map01 .loadingImg').style.display = 'none'
        document.getElementById("load_form_input").value = ''
      }
    },
    highlighter: function(code) {
      return Prism.highlight(code, Prism.languages.js, "js");
    },
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
    openDialog2 () {
      const tGeojson = new GeoJSON().writeFeatures(MyMap.drawLayer.getSource().getFeatures(), {
        featureProjection: "EPSG:3857"
      })
      this.$store.state.base.tGeojson = JSON.stringify(JSON.parse(tGeojson),null,2)
      const dialog = this.s_dialogs.dialogGeojson
      if (dialog.style.display === 'block') {
        dialog.style.display = 'none'
      } else{
        this.$store.commit('base/incrDialogMaxZindex')
        dialog.style["z-index"] = this.s_dialogMaxZindex
        dialog.style.display = 'block'
      }
    },
    openDialog () {

      if (!this.$store.state.base.editFeature) {
        alert('選択してください。')
        return
      }

      this.$store.state.base.editDiv = ''
      const dialog = this.s_dialogs['dialogColor']['map01']
      if (dialog.style.display === 'block') {
        dialog.style.display = 'none'
      } else {
        this.$store.commit('base/incrDialogMaxZindex');
        dialog.style["z-index"] = this.s_dialogMaxZindex;
        dialog.style.display = 'block'
        const rect = document.querySelector('#color-btn0').getBoundingClientRect()
        const left = (rect.x + 0 ) + 'px'
        const top = (rect.top - 0) + 'px'
        dialog.style.left = left
        dialog.style.top = top
        // MyMap.overlay['0'].setPosition(undefined)
        const geoType = this.$store.state.base.editFeature.getGeometry().getType()
        let color
        if (geoType === 'Point' || geoType === 'LineString') {
          color = this.$store.state.base.editFeature.values_._color
          if (!color) color = 'rgba(0,0,255,1)'
        } else if (geoType === 'Polygon' || geoType === 'Circle') {
          color = this.$store.state.base.editFeature.values_._fillColor
          if (!color) color = 'rgba(0,0,255,0.5)'
        }
        const rgba = d3.rgb(color)
        const colorP = { r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.opacity }
        // this.$store.state.base.editFeatureFillColor['map01'] = colorP
        if (geoType === 'Polygon' || geoType === 'Circle') {
          this.$store.state.base.editFeatureFillColor['map01'] = colorP
        } else {
          this.$store.state.base.editFeatureColor['map01'] = colorP
        }
      }
    },
    drawKodo () {
      this.kodo = !this.kodo
    },
    drawHeatMap () {
      const map01 = this.$store.state.base.maps['map01']
      const map02 = this.$store.state.base.maps['map02']
      const result = map01.getLayers().array_.find(layer => {
        return layer.get('name') === 'heatmap'
      })
      if (!result) {
        map01.removeLayer(MyMap.drawLayer)
        map02.removeLayer(MyMap.drawLayer)
        map01.addLayer(MyMap.haatMapDrawLayer)
        map02.addLayer(MyMap.haatMapDrawLayer2)
      } else {
        map01.addLayer(MyMap.drawLayer)
        map02.addLayer(MyMap.drawLayer)
        map01.removeLayer(MyMap.haatMapDrawLayer)
        map02.removeLayer(MyMap.haatMapDrawLayer2)
      }
    },
    drawVoronoi () {
      //-------------------------------------------------------------
      MyMap.undoInteraction.blockStart()
      MyMap.drawLayer.getSource().getFeatures().forEach((feature) =>{
        if (feature.getProperties()._voronoi) {
          MyMap.drawLayer.getSource().removeFeature(feature)
        }
      })
      MyMap.undoInteraction.blockEnd()
      //-------------------------------------------------------------

      let turfPoints = []
      MyMap.drawLayer.getSource().getFeatures().forEach((feature) => {
        if (feature.getGeometry().getType() === 'Point') turfPoints.push(turf.point(feature.getGeometry().getCoordinates()))
      })
      const collection = turf.featureCollection(turfPoints);
      let extent = this.$store.state.base.maps['map01'].getView().calculateExtent(this.$store.state.base.maps['map01'].getSize())
      // console.log(extent)
      const options = {
        bbox: extent,
      }
      const voronoiPolygons = turf.voronoi(collection, options);
      MyMap.undoInteraction.blockStart()
      const d3Cate10 = d3.scaleOrdinal(d3.schemeCategory10)
      voronoiPolygons.features.forEach((f,i) => {
        const rgb = d3.rgb(d3Cate10(i))
        let rgba = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0.7)"
        if (!this.voronoiColor) rgba = 'rgba(0,0,0,0)'
        const polygon = new Polygon(f.geometry.coordinates)
        const newFeature = new Feature(polygon)
        newFeature.setProperties({
          '_fillColor':rgba,
          '_voronoi':true
        })
        MyMap.drawLayer.getSource().addFeature(newFeature)
      })
      MyMap.undoInteraction.blockEnd()
    },
    drawBuffer () {
      const targetFeature = this.$store.state.base.editFeature
      if (!targetFeature) {
        alert('選択されていません。')
        return
      }
      if (targetFeature.getGeometry().getType() !== 'Point') {
        alert('点ではありません。')
        return
      }
      MyMap.drawLayer.getSource().getFeatures().forEach((feature) =>{
        if (feature.getProperties()._buffer) {
          MyMap.drawLayer.getSource().removeFeature(feature)
        }
      })
      // Wgs84でないとなぜかbufferが作れない。
      const point = turf.point(turf.toWgs84(targetFeature.getGeometry().getCoordinates()))
      const bufferFeature = turf.toMercator(turf.buffer(point, Number(this.radius)))
      let newFeature
      const polygon = new Polygon(bufferFeature.geometry.coordinates)
      newFeature = new Feature(polygon)
      newFeature.setProperties({_buffer:true})
      if (targetFeature.values_) {
        Object.keys(targetFeature.values_).forEach(function (key) {
          if (key !== 'geometry') newFeature.setProperties({[key]: targetFeature.values_[key]})
        })
      }

      MyMap.undoInteraction.blockStart()
      MyMap.drawLayer.getSource().addFeature(newFeature)
      MyMap.undoInteraction.blockEnd()

      const coordAr = newFeature.getGeometry().getCoordinates()
      const geoType = newFeature.getGeometry().getType()
      measure (geoType,newFeature,coordAr)
    },
    drawPolygonSmooth () {
      const targetFeature = this.$store.state.base.editFeature
      if (!targetFeature) {
        alert('選択されていません。')
        return
      }
      if (targetFeature.getGeometry().getType() !== 'Polygon' && targetFeature.getGeometry().getType() !== 'MultiPolygon') {
        alert('ポリゴンではありません。')
        return
      }
      const turfPolygon = turf.polygon(targetFeature.getGeometry().getCoordinates())
      const smoothFeature = turf.polygonSmooth(turfPolygon, { iterations: 3 })
      const polygonCoordinates = smoothFeature.features[0].geometry.coordinates[0]
      const polygon = new Polygon([polygonCoordinates])
      const newFeature = new Feature(polygon)

      if (targetFeature.values_) {
        Object.keys(targetFeature.values_).forEach(function (key) {
          if (key !== 'geometry') newFeature.setProperties({[key]: targetFeature.values_[key]})
        })
      }

      MyMap.undoInteraction.blockStart()
      MyMap.drawLayer.getSource().removeFeature(targetFeature)
      MyMap.drawLayer.getSource().addFeature(newFeature)
      MyMap.undoInteraction.blockEnd()

      const coordAr = newFeature.getGeometry().getCoordinates()
      const geoType = newFeature.getGeometry().getType()
      measure (geoType,newFeature,coordAr)

      this.$store.state.base.editFeature = newFeature

    },
    drawBezier () {
      const targetFeature = this.$store.state.base.editFeature
      if (!targetFeature) {
        alert('選択されていません。')
        return
      }
      if (targetFeature.getGeometry().getType() !== 'LineString') {
        alert('線ではありません。')
        return
      }

      const turfLine = turf.lineString(targetFeature.getGeometry().getCoordinates())
      const bezierSpline = turf.bezierSpline(turfLine)
      const coordinates = bezierSpline.geometry.coordinates
      const lineString = new LineString(coordinates)
      const newFeature = new Feature(lineString)

      if (targetFeature.values_) {
        Object.keys(targetFeature.values_).forEach(function (key) {
          if (key !== 'geometry') newFeature.setProperties({[key]: targetFeature.values_[key]})
        })
      }

      MyMap.undoInteraction.blockStart()
      MyMap.drawLayer.getSource().removeFeature(targetFeature)
      MyMap.drawLayer.getSource().addFeature(newFeature)
      MyMap.undoInteraction.blockEnd()

      const coordAr = newFeature.getGeometry().getCoordinates()
      const geoType = newFeature.getGeometry().getType()
      measure (geoType,newFeature,coordAr)

      this.$store.state.base.editFeature = newFeature
    },
    drawSinple () {
      const targetFeature = this.$store.state.base.editFeature
      if (!targetFeature) {
        alert('選択されていません。')
        return
      }
      if (targetFeature.getGeometry().getType() !== 'LineString' && targetFeature.getGeometry().getType() !== 'MultiLineString' && targetFeature.getGeometry().getType() !== 'Polygon') {
        alert('線又はポリゴンではありません。')
        return
      }
      const fiatureGeojson = new GeoJSON().writeFeatures([targetFeature], {
        featureProjection: "EPSG:3857"
      })
      const features = JSON.parse(fiatureGeojson).features
      console.log(features[0])

      // const ooord = turf.toWgs84(targetFeature.getGeometry().getCoordinates())
      // const bufferFeature = turf.toMercator(turf.buffer(point, Number(this.radius)))

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
      } else if (targetFeature.getGeometry().getType() === 'MultiLineString') {
        sinpleFeature.geometry.coordinates.forEach((coords,i) => {
          coordinates.push([])
          coords.forEach((coord) => {
            coordinates[i].push(transform(coord, "EPSG:4326", "EPSG:3857"))
          })
        })
        const multiLineString = new MultiLineString(coordinates)
        newFeature = new Feature(multiLineString)
      } else {
        sinpleFeature.geometry.coordinates[0].forEach((coord) => {
          polygonCoordinates.push(transform(coord, "EPSG:4326", "EPSG:3857"))
        })
        console.log(polygonCoordinates)
        const polygon = new Polygon([polygonCoordinates])
        newFeature = new Feature(polygon)
      }
      if (targetFeature.values_) {
        Object.keys(targetFeature.values_).forEach(function (key) {
          if (key !== 'geometry') newFeature.setProperties({[key]: targetFeature.values_[key]})
        })
      }

      MyMap.undoInteraction.blockStart()
      MyMap.drawLayer.getSource().removeFeature(targetFeature)
      MyMap.drawLayer.getSource().addFeature(newFeature)
      MyMap.undoInteraction.blockEnd()

      const coordAr = newFeature.getGeometry().getCoordinates()
      const geoType = newFeature.getGeometry().getType()
      measure (geoType,newFeature,coordAr)

      this.$store.state.base.editFeature = newFeature

    },
    drawCopy () {
      MyMap.myCollection.array_ = []
      MyMap.myCollection.array_.push(this.$store.state.base.editFeature)

      MyMap.copyInteraction.copy({ silent: false })
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
      const tGeojson = new GeoJSON().writeFeatures(features, {
        featureProjection: "EPSG:3857"
      })
      // console.log(tGeojson)
      const type = "text/plain";
      const blob = new Blob([tGeojson], {type: type});
      const a = document.getElementById('download');
      a.href = window.URL.createObjectURL(blob);
      a.click()
    },
    saveCsv () {
      function ud(text) {
        if (text === undefined) {
          return ''
        } else {
          if (text.indexOf(',') === -1) {
            return text
          } else {
            return '"' + text + '"'
          }
        }
      }
      const features = drawLayer.getSource().getFeatures()
      features.forEach(function(feature){
        if (feature.getGeometry().getType() === 'Circle') {
          const radius = feature.getGeometry().getRadius();
          const center = feature.getGeometry().getCenter();
          feature.set('radius', radius);
          feature.set('center', center);
        }
      })
      const tGeojson = new GeoJSON().writeFeatures(features, {
        featureProjection: "EPSG:3857"
      })
      console.log(tGeojson)
      const pGeojson = JSON.parse(tGeojson)
      console.log(pGeojson.features)
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const header = "geoType,経度,緯度,coords,名称,説明,色,塗りつぶし色,距離,面積,center,radius\r\n";
      let data = header
      pGeojson.features.forEach((feature) => {
        console.log(feature)
        // console.log(feature.geometry.coordinates[0])
        data += feature.geometry.type + ","
        if (feature.geometry.type === 'Point') {
          data += feature.geometry.coordinates[0] + ","
          data += feature.geometry.coordinates[1] + ","
          data += ','
        } else if (feature.geometry.type === 'LineString') {
          data += ','
          data += ','
          data += ud(JSON.stringify(feature.geometry.coordinates)) + ','
        } else if (feature.geometry.type.indexOf('Polygon') !== -1) {
          data += ','
          data += ','
          data += ud(JSON.stringify(feature.geometry.coordinates)) + ','
          console.log(ud(JSON.stringify(feature.geometry.coordinates)))
        } else if (feature.geometry.type === 'GeometryCollection') {
          data += ','
          data += ','
          data += ','
        }
        if (!feature.properties) {
          feature.properties = {}
        }
        const prop = feature.properties
        console.log(feature.properties)
        data += ud(prop.name) + ","
        data += ud(prop.description) + ","
        if (feature.geometry.type === 'Point' || feature.geometry.type === 'LineString') {
          data += ud(prop._color) + ","
          data += ","
        } else {
          data += ","
          data += ud(prop._fillColor) + ","
        }
        data += ud(prop._distance) + ","
        data += ud(prop._area) + ","
        if (feature.geometry.type === 'GeometryCollection') {
          console.log(prop.radius)
          data += ud(JSON.stringify(prop.center))+ ","
          data += prop.radius+ ","
        } else {
          data += ","
          data += ","
        }


        // Object.keys(prop).forEach(function(key) {
        //   console.log(key)
        //   console.log(prop[key])
        //   if (prop[key].indexOf(',') === -1) {
        //     data += prop[key] + ","
        //   } else {
        //     console.log(9999999999999,'"' + prop[key] + '"')
        //     data += '"' + prop[key] + '"' + ','
        //   }
        // })
        data = data.slice(0, -1)
        data += "\r\n";
      })

      const type = "text/plain";
      const blob = new Blob([bom,data], {type: type});
      const a = document.getElementById('download-csv');
      a.href = window.URL.createObjectURL(blob);
      a.click()
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
      this.s_toggleHole = false
      this.s_toggleSplit = false
      if (!store.state.base.editFeature) {
        alert('選択されていません。')
        this.s_toggleText = true
      }

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
    },
    s_drawMode(newValue) {
      console.log(newValue)
      const dragHandle = document.querySelector('#dialog-measure .drag-handle');
      if (newValue === 'sentaku') {
        MyMap.modifyInteraction.setActive(false)
        MyMap.modifyTouchInteraction.setActive(false)
        MyMap.transformInteraction.setActive(false)
        dragHandle.innerHTML = '<span style="color: blue;">選択モード中</span>'
        MyMap.transformInteraction.select(this.$store.state.base.editFeature, true)
        // this.$store.state.base.editFeature = null
        MyMap.drawLayer.getSource().changed()
        MyMap.overlay['0'].setPosition(undefined)
      } else if (newValue === 'henkei') {
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
        this.s_toggleHole = false
        this.s_toggleText = false
        this.s_toggleHole = false
        this.s_toggleSplit = false

        MyMap.modifyInteraction.setActive(true)
        MyMap.modifyTouchInteraction.setActive(true)
        MyMap.transformInteraction.setActive(false)

        dragHandle.innerHTML = '<span style="color: yellow;">変形モード中</span>'
        // MyMap.transformInteraction.select(this.$store.state.base.editFeature, true)
        // this.$store.state.base.editFeature = null
        // MyMap.drawLayer.getSource().changed()
        MyMap.overlay['0'].setPosition(undefined)
        // store.state.base.editFeature = null
        MyMap.drawLayer.getSource().changed()
      } else if (newValue === 'ido') {
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
        this.s_toggleHole = false
        this.s_toggleIdo = false
        this.s_toggleText = false
        this.s_toggleHole = false
        this.s_toggleSplit = false
        MyMap.modifyInteraction.setActive(false)
        MyMap.modifyTouchInteraction.setActive(false)
        MyMap.transformInteraction.setActive(true)

        dragHandle.innerHTML = '<span style="color: red;">移動,拡大モード中</span>'
        MyMap.transformInteraction.select(this.$store.state.base.editFeature, true)
        // this.$store.state.base.editFeature = null
        MyMap.overlay['0'].setPosition(undefined)
        MyMap.drawLayer.getSource().changed()
      }
    }
  },
  mounted () {
    const dragHandle = document.querySelector('#dialog-measure .drag-handle');
    dragHandle.innerHTML = '<span style="color: blue;">選択モード中</span>'
    // this.$watch(function () {
    //   return [this.s_toggleIdo]
    // }, function () {
    //   if (this.s_toggleIdo) {
    //     console.log('on')
    //     this.s_togglePoint0 = false
    //     this.s_toggleLine = false
    //     this.s_toggleFreeHand = false
    //     this.s_togglePoint = false
    //     this.s_toggleMenseki = false
    //     this.s_toggleCircle = false
    //     this.s_toggleDaen = false
    //     this.s_toggleShikaku = false
    //     this.toggleDelete = false
    //     this.toggleDanmen = false
    //     this.s_toggleHole = false
    //     this.s_toggleIdo2 = false
    //     this.s_toggleText = false
    //     this.s_toggleHole = false
    //     this.s_toggleSplit = false
    //
    //     MyMap.modifyInteraction.setActive(true)
    //     MyMap.modifyTouchInteraction.setActive(true)
    //     MyMap.transformInteraction.setActive(false)
    //
    //     dragHandle.innerHTML = '<span style="color: yellow;">変形モード中</span>'
    //     // MyMap.transformInteraction.select(this.$store.state.base.editFeature, true)
    //     // this.$store.state.base.editFeature = null
    //     // MyMap.drawLayer.getSource().changed()
    //
    //     MyMap.overlay['0'].setPosition(undefined)
    //     // store.state.base.editFeature = null
    //     MyMap.drawLayer.getSource().changed()
    //   } else {
    //     console.log('off')
    //     console.log(this.$store.state.base.togglePoint0,this.$store.state.base.drawEndFlg)
    //     MyMap.modifyInteraction.setActive(false)
    //     MyMap.modifyTouchInteraction.setActive(false)
    //     // MyMap.transformInteraction.setActive(false)
    //
    //     // dragHandle.innerHTML = ''
    //
    //     this.$store.state.base.drawEndFlg = false
    //
    //     console.log(this.$store.state.base.togglePoint0,this.$store.state.base.drawEndFlg)
    //     MyMap.drawLayer.getSource().changed()
    //   }
    // })
    // this.$watch(function () {
    //   return [this.s_toggleIdo2]
    // }, function () {
    //   if (this.s_toggleIdo2) {
    //     console.log('on')
    //     this.s_togglePoint0 = false
    //     this.s_toggleLine = false
    //     this.s_toggleFreeHand = false
    //     this.s_togglePoint = false
    //     this.s_toggleMenseki = false
    //     this.s_toggleCircle = false
    //     this.s_toggleDaen = false
    //     this.s_toggleShikaku = false
    //     this.toggleDelete = false
    //     this.toggleDanmen = false
    //     this.s_toggleHole = false
    //     this.s_toggleIdo = false
    //     this.s_toggleText = false
    //     this.s_toggleHole = false
    //     this.s_toggleSplit = false
    //
    //
    //     MyMap.modifyInteraction.setActive(false)
    //     MyMap.modifyTouchInteraction.setActive(false)
    //     MyMap.transformInteraction.setActive(true)
    //
    //     dragHandle.innerHTML = '<span style="color: red;">移動,拡大モード中</span>'
    //     MyMap.transformInteraction.select(this.$store.state.base.editFeature, true)
    //     // this.$store.state.base.editFeature = null
    //     MyMap.drawLayer.getSource().changed()
    //
    //     MyMap.overlay['0'].setPosition(undefined)
    //     MyMap.overlay['0'].setPosition(undefined)
    //     // store.state.base.editFeature = null
    //     MyMap.drawLayer.getSource().changed()
    //   } else {
    //     console.log('off')
    //     console.log(this.$store.state.base.togglePoint0,this.$store.state.base.drawEndFlg)
    //     // MyMap.modifyInteraction.setActive(false)
    //     // MyMap.modifyTouchInteraction.setActive(false)
    //     // MyMap.transformInteraction.setActive(false)
    //
    //     // dragHandle.innerHTML = ''
    //
    //     this.$store.state.base.drawEndFlg = false
    //
    //     console.log(this.$store.state.base.togglePoint0,this.$store.state.base.drawEndFlg)
    //     MyMap.drawLayer.getSource().changed()
    //   }
    // })
    // this.$watch(function () {
    //   return [this.s_toggleText]
    // }, function () {
    //   if (this.s_toggleText) {
    //     console.log('on')
    //     // this.s_togglePoint0 = false
    //     // this.s_toggleLine = false
    //     // this.s_toggleFreeHand = false
    //     // this.s_togglePoint = false
    //     // this.s_toggleMenseki = false
    //     // this.s_toggleCircle = false
    //     // this.s_toggleDaen = false
    //     // this.s_toggleShikaku = false
    //     // this.toggleDelete = false
    //     // this.toggleDanmen = false
    //     // this.s_toggleHole = false
    //     this.s_toggleIdo = false
    //     this.s_toggleIdo2 = false
    //     this.s_toggleSplit = false
    //
    //
    //     MyMap.modifyInteraction.setActive(false)
    //     MyMap.modifyTouchInteraction.setActive(false)
    //     MyMap.transformInteraction.setActive(false)
    //
    //     dragHandle.innerHTML = '<span style="color: blue;">選択モード中</span>'
    //     MyMap.transformInteraction.select(this.$store.state.base.editFeature, true)
    //     // this.$store.state.base.editFeature = null
    //     MyMap.drawLayer.getSource().changed()
    //
    //     MyMap.overlay['0'].setPosition(undefined)
    //   } else {
    //     console.log('off')
    //     console.log(this.$store.state.base.togglePoint0,this.$store.state.base.drawEndFlg)
    //     // MyMap.modifyInteraction.setActive(false)
    //     // MyMap.modifyTouchInteraction.setActive(false)
    //     // MyMap.transformInteraction.setActive(false)
    //
    //     // dragHandle.innerHTML = ''
    //
    //     this.$store.state.base.drawEndFlg = false
    //
    //     console.log(this.$store.state.base.togglePoint0,this.$store.state.base.drawEndFlg)
    //   }
    // })
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
        this.s_toggleHole = false
        this.s_toggleSplit = false

        this.$store.state.base.maps['map01'].addInteraction(MyMap.circleInteraction)
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
        this.s_toggleHole = false
        this.s_toggleSplit = false

        this.$store.state.base.maps['map01'].addInteraction(MyMap.daenInteraction)

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
        this.s_toggleHole = false
        this.s_toggleSplit = false

        this.$store.state.base.maps['map01'].addInteraction(MyMap.polygonInteraction)
        this.$store.state.base.maps['map01'].addInteraction(MyMap.snapnteraction)
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
        this.s_toggleHole = false
        this.s_toggleSplit = false

        this.$store.state.base.maps['map01'].addInteraction(MyMap.regularInteraction)
        // this.$store.state.base.maps['map01'].removeInteraction(MyMap.modifyInteraction)
        // this.$store.state.base.maps['map01'].removeInteraction(MyMap.transformInteraction)
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
        this.s_toggleHole = false
        this.s_toggleSplit = false

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
        this.s_toggleHole = false
        this.s_toggleSplit = false

        this.$store.state.base.maps['map01'].addInteraction(MyMap.lineInteraction)

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
        this.s_toggleHole = false
        this.s_toggleSplit = false

        this.$store.state.base.maps['map01'].addInteraction(MyMap.freeHandInteraction)

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
        this.s_toggleHole = false
        this.s_toggleSplit = false

        this.$store.state.base.maps['map01'].addInteraction(MyMap.pointInteraction)

        this.$store.state.base.drawType = 'point'
      } else {
        console.log('off')
        // MyMap.drawLayer.getSource().clear()
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.pointInteraction)
      }
    })
    this.$watch(function () {
      return [this.s_toggleHole]
    }, function () {
      if (this.s_toggleHole) {
        this.s_togglePoint0 = false
        this.s_toggleLine = false
        this.s_toggleFreeHand = false
        this.s_togglePoint = false
        this.s_toggleMenseki = false
        this.s_toggleCircle = false
        this.s_toggleShikaku = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.toggleDaen = false
        this.s_toggleSplit = false

        this.$store.state.base.maps['map01'].addInteraction(MyMap.drawHoleInteraction)

      } else {
        console.log('off')
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.drawHoleInteraction)
      }
    })
    this.$watch(function () {
      return [this.s_toggleSplit]
    }, function () {
      if (this.s_toggleSplit) {
        this.s_togglePoint0 = false
        this.s_toggleLine = false
        this.s_toggleFreeHand = false
        this.s_togglePoint = false
        this.s_toggleMenseki = false
        this.s_toggleCircle = false
        this.s_toggleShikaku = false
        this.toggleDelete = false
        this.toggleDanmen = false
        this.toggleDaen = false
        this.s_toggleHole = false

        MyMap.splitInteraction.setActive(true)

      } else {
        console.log('off')
        MyMap.splitInteraction.setActive(false)
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
<style>
.modifytouch .ol-popup-content{
  font-size: large!important;
  cursor: pointer!important;
}
</style>

