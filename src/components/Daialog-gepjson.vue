<template>
  <v-dialog :dialog="s_dialogGeojson" id="dialog-geojson">
    <div :style="contentSize">
      <b-button style="margin-top: 5px; margin-left: 0px;margin-bottom: 5px;" class='olbtn' size="sm" @click="hanei">反映</b-button>
      <b-button style="margin-top: 5px; margin-left: 5px;margin-bottom: 5px;" class='olbtn' size="sm" @click="undo">戻す</b-button>
      <b-button style="margin-top: 5px; margin-left: 5px;margin-bottom: 5px;" class='olbtn' size="sm" @click="redo">やり直し</b-button>

      <prism-editor :style="maxHeight" class="my-editor height-200" v-model="s_tGeojson" :highlight="highlighter" line-numbers></prism-editor>
    </div>
  </v-dialog>
</template>

<script>
import * as MyMap from '../js/mymap'
import {moveEnd} from "@/js/permalink"
import store from "@/js/store";
import * as d3 from "d3";
import * as Layer from "@/js/layers";
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere
// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles
import {GPX, GeoJSON, IGC, KML, TopoJSON} from 'ol/format.js'
export default {
  name: "dialog-geojson",
  props: ['mapName'],
  data () {
    return {
      contentSize: {'height': '100%', 'width': 'auto', 'margin': '5px', 'overflow': 'hidden', 'user-select': 'text'},
      maxHeight: {'max-height':'600px'},
    }
  },
  components: {
    'PrismEditor': PrismEditor
  },
  computed: {
    s_dialogGeojson () {
      return this.$store.state.base.dialogs.dialogGeojson
    },
    s_tGeojson: {
      get() {
        return this.$store.state.base.tGeojson
      },
      set(value) {
        this.$store.state.base.tGeojson = value
      }
    },
  },
  methods: {
    undo () {
      MyMap.undoInteraction.undo()
    },
    redo () {
      MyMap.undoInteraction.redo()
    },
    hanei () {
      try {
        const features = new GeoJSON({
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        }).readFeatures(JSON.parse(this.s_tGeojson))
        MyMap.undoInteraction.blockStart()
        MyMap.drawLayer.getSource().clear()
        MyMap.drawLayer.getSource().addFeatures(features)
        MyMap.undoInteraction.blockEnd()
      } catch (e) {
        const result = window.confirm('間違えています。元に戻しますか？');
        if( !result ) return
        const tGeojson = new GeoJSON().writeFeatures(MyMap.drawLayer.getSource().getFeatures(), {
          featureProjection: "EPSG:3857"
        })
        store.state.base.tGeojson = JSON.stringify(JSON.parse(tGeojson),null,2)
      }
    },
    highlighter: function(code) {
      return Prism.highlight(code, Prism.languages.js, "js");
    },
    upLoad(){
      document.getElementById("my_form_input").click();
    },
  },
  mounted () {
    this.maxHeight["max-height"] = (window.innerHeight - 200) + 'px'
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
.my-editor {
  background: #2d2d2d;
  color: white!important;
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  /*max-height: 600px;*/
  min-width: 500px;
}
@media screen and (max-width:400px) {
  .my-editor {
    width: 390px;
    font-size: 12px;
    line-height: 1.2;
  }
}
</style>
<style>

</style>
