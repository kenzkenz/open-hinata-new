<template>
  <v-dialog :dialog="s_dialogTrack" id="dialog-share">
    <div :style="contentSize">
      <p>トラッキングします。トラッキング中は操作ができません。スリープしません。</p>
      <p>精度：{{ accuracy }}</p>
      <b-button style="margin-top: 5px; margin-left: 0px;" class='olbtn' size="sm" @click="drawStart">スタート</b-button>
      <b-button style="margin-top: 5px; margin-left: 5px;" class='olbtn' size="sm" @click="drawPause">ポーズ</b-button>
      <b-button style="margin-top: 5px; margin-left: 5px;" class='olbtn' size="sm" @click="drawStop">停止</b-button>
      <b-button style="margin-top: 5px; margin-left: 35px;" class='olbtn' size="sm" @click="drawPoint">ポイント一点だけ</b-button>
    </div>
  </v-dialog>
</template>

<script>
const noSleep = new NoSleep()
import * as MyMap from "@/js/mymap";
import {geolocationDrawInteraction} from "@/js/mymap";
import {moveEnd} from "@/js/permalink"
import {transform} from "ol/proj";
import {Circle,LineString,Polygon,Point} from "ol/geom";
import Feature from "ol/Feature"
import NoSleep from 'nosleep.js'

export default {
  name: "dialog-track",
  props: ['mapName'],
  data () {
    return {
      accuracy: '',
      contentSize: {'height': 'auto','margin': '10px', 'overflow': 'auto', 'user-select': 'text', 'position': 'relative'},
    }
  },
  components: {
  },
  computed: {
    s_dialogTrack () {
      return this.$store.state.base.dialogs.dialogTrack
    },
    s_shareUrl () {
      return this.$store.state.base.shareUrl
    },
  },
  methods: {
    drawPoint () {
      const success = (pos) =>{
        const lon = pos.coords.longitude
        const lat = pos.coords.latitude
        const center = transform([lon,lat],"EPSG:4326","EPSG:3857")
        this.$store.state.base.maps['map01'].getView().setCenter(center)
        this.$store.state.base.maps['map01'].getView().setZoom(17)
        const point = new Point(center)
        const newFeature = new Feature(point)
        let date = new Date()
        var d1 = date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' +('0' + date.getDate()).slice(-2) + ' ' +  ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
        newFeature.setProperties({name:d1})
        MyMap.drawLayer.getSource().addFeature(newFeature)
        MyMap.history('トラッキング現在地取得')
        moveEnd()
      }
      const  fail = (error) =>{alert('位置情報の取得に失敗しました。エラーコード：' + error.code)}
      navigator.geolocation.getCurrentPosition(success, fail)
    },
    drawStart () {
      MyMap.geolocationDrawInteraction.start()
      MyMap.history('トラッキングスタート')
      noSleep.enable()
      this.$store.state.base.noSleepFlg = true
      moveEnd()
    },
    drawPause () {
      MyMap.geolocationDrawInteraction.pause(true)
      moveEnd()
    },
    drawStop () {
      MyMap.geolocationDrawInteraction.stop()
      MyMap.history('トラッキングストップ')
      MyMap.drawLayer.getSource().changed()
      noSleep.disable()
      this.$store.state.base.noSleepFlg = false
      moveEnd()
    },
  },
  mounted () {
    const vm = this
    geolocationDrawInteraction.on("tracking", function(e) {
      console.log(e.geolocation.getAccuracy())
      console.log(e.geolocation.getHeading())
      console.log(e.geolocation.getAltitude())
      vm.accuracy = e.geolocation.getAccuracy()
      moveEnd()
    })
  }
}
</script>

<style scoped>
.olbtn{
  background-color: rgba(0,60,136,0.5);
}
.olbtn:hover{
  background-color: rgba(0,60,136,0.7);
}
#accuracy {
  display: block;
  background: #f00;
  height:10px;
  max-width: 200px;
}
</style>

