<template>
  <v-dialog :dialog="s_dialogColor" id="dialog-color">
    <div :style="contentSize">
      <chrome-picker v-model="s_featureColor"/>
<!--      <chrome-picker v-model="s_featureColor" @input="changeColor"/>-->
    </div>
  </v-dialog>
</template>

<script>
import * as MyMap from '../js/mymap'
import {moveEnd} from "@/js/permalink"
import store from "@/js/store";
import {Chrome} from 'vue-color'

export default {
  name: "dialog-color",
  data () {
    return {
      featureColor: { r: 25, g: 77, b: 51, a: 0.5 },
      contentSize: {'height': 'auto', 'margin': '10px', 'overflow': 'hidden', 'user-select': 'text'},
    }
  },
  components: {
    'chrome-picker': Chrome
  },
  computed: {
    s_dialogColor () {
      return this.$store.state.base.dialogs.dialogColor
    },
    s_featureColor: {
      get () {
        console.log(this.$store.state.base.editFeatureColor)
        return this.$store.state.base.editFeatureColor
      },
      set (value) {
        console.log(value)
        this.$store.state.base.editFeatureColor = value
        const rgb = 'rgb(' + this.s_featureColor.rgba.r + ',' + this.s_featureColor.rgba.g + ',' + this.s_featureColor.rgba.b + ')'
        const rgba = 'rgba(' + this.s_featureColor.rgba.r + ',' + this.s_featureColor.rgba.g + ',' + this.s_featureColor.rgba.b + ',' + this.s_featureColor.rgba.a + ')'
        // this.$store.state.base.editFeatureColor = rgba
        const feature = this.$store.state.base.editFeature
        console.log(feature.getGeometry().getType())
        const geoType = feature.getGeometry().getType()
        if (geoType === 'Point' || geoType === 'LineString') feature.setProperties({_color: rgba})
        if (geoType === 'Polygon' || geoType === 'Circle') feature.setProperties({_fillColor: rgba})
        moveEnd()
      }
    },
    s_featureSrc () {
      return this.$store.state.base.editFeatureSrc
    },
  },
  methods: {
    upLoad(){
      document.getElementById("my_form_input").click();
    },
    featureRemove(){
      const result = window.confirm('削除しますか。');
      if( !result ) return
      MyMap.drawLayer.getSource().removeFeature(this.$store.state.base.editFeature)
      MyMap.drawLayer2.getSource().removeFeature(this.$store.state.base.editFeature)
      store.state.base.dialogs.dialogEdit.style.display = 'none'
      MyMap.overlay['0'].setPosition(undefined)
    },
    changeName(e) {
      const feature = this.$store.state.base.editFeature
      feature.setProperties({name: this.$store.state.base.editFeatureName})
      feature.setProperties({setumei: this.$store.state.base.editFeatureSetumei})
      document.querySelector('#drawLayer2-name').innerHTML = this.$store.state.base.editFeatureName
      document.querySelector('#drawLayer2-setumei').innerHTML = this.$store.state.base.editFeatureSetumei
      moveEnd()
    },
  },
  mounted () {
    console.log(this.$store.state.base.editFeatureColor)
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
