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
      color: '',
      contentSize: {'height': 'auto', 'margin': '10px', 'overflow': 'hidden', 'user-select': 'text'},
    }
  },
  components: {
    'compact-picker': Compact,
    'chrome-picker': Chrome
  },
  computed: {
    s_editFeature () {
      return this.$store.state.base.editFeature
    },
    s_dialogColor () {
      // const mapName = this.$store.state.base.editMap
      return this.$store.state.base.dialogs.dialogColor[this.mapName]
    },
    s_divs () {
      return this.$store.state.info.divs
    },
    // 重要
    s_featureColor: {
      get () {
        // return 'rgba(0,0,255)'
        return this.color
        // return this.$store.state.base.editFeatureFillColor[this.mapName]
      },
      set (value) {
        const feature = this.$store.state.base.editFeature
        const geoType = feature.getGeometry().getType()
        if (geoType === 'Polygon' || geoType === 'Circle') {
          this.$store.state.base.editFeatureFillColor[this.mapName] = value
          console.log(9999)
        } else {
          this.$store.state.base.editFeatureColor[this.mapName] = value

        }

        // const rgb = 'rgb(' + this.s_featureColor.rgba.r + ',' + this.s_featureColor.rgba.g + ',' + this.s_featureColor.rgba.b + ')'
        const rgba = 'rgba(' + value.rgba.r + ',' + value.rgba.g + ',' + value.rgba.b + ',' + value.rgba.a + ')'
        // this.$store.state.base.editFeatureFillColor = rgba

        // if (!feature.getProperties()._fillColor) {
        //   feature.setProperties({_fillColor: 'rgba(0,0,255,0.5)'})
        // }
        const before = {
          prop: feature.getProperties(),
          feature: feature
        }

        if (geoType === 'Point' || geoType === 'LineString') {
          feature.setProperties({_color: rgba})
        }
        if (geoType === 'Polygon' || geoType === 'Circle') {
          feature.setProperties({_fillColor: rgba})
        }
        const after = {prop:feature.getProperties(),feature:feature}
        MyMap.undoInteraction.push('drawProp', { before: before, after: after });
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
  watch: {
    s_editFeature(editFeature) {
      if (editFeature) {
        const geoType = editFeature.getGeometry().getType()
        if (geoType === 'Polygon' || geoType === 'Circle') {
          this.color = this.$store.state.base.editFeatureFillColor[this.mapName]
          if (!this.color) this.color = 'rgba(0,0,255,0.5)'
        } else {
          this.color = this.$store.state.base.editFeatureColor[this.mapName]
          if (!this.color) this.color = 'rgba(0,0,255,1)'
        }
      }
    }
  },
  mounted () {
    // console.log(this.$store.state.base.editFeatureFillColor)
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
