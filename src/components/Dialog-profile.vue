<template>
  <v-dialog :dialog="s_dialogProfile" id="dialog-profile">
    <div :style="contentSize">
      <div id="profile-div">
      </div>
    </div>
  </v-dialog>
</template>

<script>
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
      contentSize: {'height': 'auto','margin': '10px', 'overflow': 'auto', 'user-select': 'text', 'position': 'relative'},
    }
  },
  components: {
  },
  computed: {
    s_dialogProfile () {
      return this.$store.state.base.dialogs.dialogProfile
    },
  },
  methods: {
  },
  mounted () {
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
</style>

