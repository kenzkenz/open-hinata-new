<template>
  <v-dialog :dialog="s_dialogProfile" id="dialog-share">
    <div :style="contentSize">
      <div id="profile-div">
      </div>
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
  name: "dialog-profile",
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
    s_dialogProfile () {
      return this.$store.state.base.dialogs.dialogProfile
    },
    s_shareUrl () {
      return this.$store.state.base.shareUrl
    },
  },
  methods: {
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

