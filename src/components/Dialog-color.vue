<template>
  <v-dialog :dialog="s_dialogColor" id="dialog-color">
    <div :style="contentSize">
      <chrome-picker v-model="s_featureColor"/>
<!--      <compact-picker v-model="s_featureColor"/>-->
    </div>
  </v-dialog>
</template>

<script>
import * as MyMap from '../js/mymap'
import {moveEnd} from "@/js/permalink"
import store from "@/js/store";
import {Chrome} from 'vue-color'
import {Compact} from 'vue-color'
import * as d3 from "d3";
import * as Layer from "@/js/layers";
export default {
  name: "dialog-color",
  props: ['mapName'],
  data () {
    return {
      featureColor: { r: 25, g: 77, b: 51, a: 0.5 },
      contentSize: {'height': 'auto', 'margin': '10px', 'overflow': 'hidden', 'user-select': 'text'},
    }
  },
  components: {
    'compact-picker': Compact,
    'chrome-picker': Chrome
  },
  computed: {
    s_dialogColor () {
      // const mapName = this.$store.state.base.editMap
      return this.$store.state.base.dialogs.dialogColor[this.mapName]
    },
    s_divs () {
      return this.$store.state.info.divs
    },
    s_featureColor: {
      get () {
        console.log(this.$store.state.base.editFeatureColor)
        return this.$store.state.base.editFeatureColor
      },
      set (value) {
        console.log(value)
        if (this.$store.state.base.editDiv) {
          const id = this.$store.state.base.editDiv.id
          const mapName = this.$store.state.base.editMap
          console.log(id)
          const result = this.$store.state.info.divs[this.mapName].find((div) => {
            return div.id === id
          })
          const rgb = 'rgb(' + value.rgba.r + ',' + value.rgba.g + ',' + value.rgba.b + ')'
          result.rgb = rgb


          // ---------------------------------------------------------------
          const maxM = d3.max(this.s_divs[this.mapName], function(d){ return d.m; })
          const mArr = this.s_divs[this.mapName].map((v) => {
            return v.m
          })
          const rgbArr = this.s_divs[this.mapName].map((v) => {
            return v.rgb
          })
          const hyokozuColor = d3.scaleLinear().domain(mArr).range(rgbArr)

          for (let i = 0; i < maxM; i++) {
            this.$store.state.info.hyokozuColors[i] = d3.rgb(hyokozuColor(i))
          }
          Layer.hyokozu1Obj[this.mapName].getSource().changed()
          // ---------------------------------------------------------------

        } else {
          this.$store.state.base.editFeatureColor = value
          const rgb = 'rgb(' + this.s_featureColor.rgba.r + ',' + this.s_featureColor.rgba.g + ',' + this.s_featureColor.rgba.b + ')'
          const rgba = 'rgba(' + this.s_featureColor.rgba.r + ',' + this.s_featureColor.rgba.g + ',' + this.s_featureColor.rgba.b + ',' + this.s_featureColor.rgba.a + ')'
          // this.$store.state.base.editFeatureColor = rgba
          const feature = this.$store.state.base.editFeature
          console.log(feature.getGeometry().getType())
          const geoType = feature.getGeometry().getType()
          if (geoType === 'Point' || geoType === 'LineString') feature.setProperties({_color: rgba})
          if (geoType === 'Polygon' || geoType === 'Circle') feature.setProperties({_fillColor: rgba})
        }
        // this.$store.state.base.editDiv = ''

        // ----------------------------------------------



        // this.$store.state.info.divs






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
