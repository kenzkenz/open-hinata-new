<template>
  <v-dialog :dialog="s_dialogColor2" id="dialog-color">
    <div :style="contentSize">
      2
      <chrome-picker v-model="s_hyokoColor"/>
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
  name: "dialog-color2",
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
    s_dialogColor2 () {
      return this.$store.state.base.dialogs.dialogColor2[this.mapName]
    },
    s_divs () {
      return this.$store.state.info.divs
    },
    // 重要
    s_hyokoColor: {
      get () {
        return this.$store.state.base.hyokoColor[this.mapName]
      },
      set (value) {
        if (this.$store.state.base.editGColorElm) {
          const targetElm = this.$store.state.base.editGColorElm
          const rgb = 'rgb(' + value.rgba.r + ',' + value.rgba.g + ',' + value.rgba.b + ')'
          targetElm.style.backgroundColor = rgb
          if (this.$store.state.base.editGColoraaa === 0) {
            this.$store.state.info.gColor0[this.mapName]  = rgb
          } else {
            this.$store.state.info.gColor1[this.mapName]  = rgb
          }
        } else if (this.$store.state.base.editDiv) {
          const id = this.$store.state.base.editDiv.id
          const result = this.$store.state.info.divs[this.mapName].find((div) => {
            return div.id === id
          })
          const rgb = 'rgb(' + value.rgba.r + ',' + value.rgba.g + ',' + value.rgba.b + ')'
          result.rgb = rgb
          // ---------------------------------------------------------------
          const bai = 100
          let divs2 = JSON.parse(JSON.stringify(this.s_divs[this.mapName]))
          divs2.forEach((div) => {
            div.m = div.m * 100
            div.rgb = d3.rgb(div.rgb)
          })
          divs2 = divs2.filter((div) => {
            return div.id !== 9999
          })
          this.$store.state.info.divs2[this.mapName] = divs2
          // ---------------------------------------------------------------
          let divs = JSON.parse(JSON.stringify(this.s_divs[this.mapName]))
          divs.sort(function(a, b) {
            if (a.m > b.m) {
              return 1;
            } else {
              return -1;
            }
          })
          const aaa = divs.find((div) => {
            return div.id === 9999
          })
          this.$store.state.info.maxRgb[this.mapName] = d3.rgb(aaa.rgb)
          divs = divs.filter((div) => {
            return div.id !== 9999
          })
          const maxM = d3.max(divs, function(d){ return d.m; }) * bai
          this.$store.state.info.maxM[this.mapName] = maxM
          const minM = d3.min(divs, function(d){ return d.m; })
          const mArr = divs.map((v) => {
            return v.m * bai
          })
          const rgbArr = divs.map((v) => {
            return v.rgb
          })
          const hyokozuColor = d3.scaleLinear().domain(mArr).range(rgbArr)

          for (let i = 0; i < maxM; i++) {
            this.$store.state.info.hyokozuColors[this.mapName][i] = d3.rgb(hyokozuColor(i))
          }
          Layer.hyokozu1Obj[this.mapName].getSource().changed()
          Layer.hyokozu2Obj[this.mapName].getSource().changed()
          // ---------------------------------------------------------------
        }
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
    // console.log(this.$store.state.base.hyokoColor)
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
