<template>
  <v-dialog :dialog="s_dialogDokuji" id="dialog-dokuji">
    <div :style="contentSize">
      名称<br>
      <input type='text' @input="onInput" v-model="s_dokujiName" style="width: 300px;"><br>
      タイルURL<br>
      <input type='text' @input="onInput" v-model="s_dokujiUrl" style="width: 300px;"><br>
      <b-button style="margin-top: 5px;" class="olbtn" size="sm" @click="toroku">タイル追加</b-button>
    </div>
  </v-dialog>
</template>

<script>
import * as MyMap from '../js/mymap'
import {moveEnd} from "@/js/permalink"
import store from "@/js/store";
import * as permalink from "@/js/permalink";
import * as layers from '@/js/layers'
import * as d3 from "d3";
import {dokujiObjAr} from "@/js/layers";
export default {
  name: "dialog-dokuhi",
  data () {
    return {
      contentSize: {'height': 'auto', 'margin': '10px', 'overflow': 'hidden', 'user-select': 'text'},
    }
  },
  components: {
  },
  computed: {
    s_dialogDokuji () {
      return this.$store.state.base.dialogs.dialogDokuji
    },
    s_dialogMaxZindex () { return this.$store.state.base.dialogMaxZindex},
    s_dialogs () { return this.$store.state.base.dialogs},
    s_layerList: {
      get () {return store.getters['base/layerList'](this.mapName)},
      set (value) { store.commit('base/updateList', {value: value, mapName: this.mapName}) }
    },
    s_dokujiName:{
      get() {
        return this.$store.state.info.dokujiName['map01']
      },
      set(value) {
        this.$store.state.info.dokujiName['map01'] = value
        permalink.moveEnd()
      }
    },
    s_dokujiUrl:{
      get() {
        return this.$store.state.info.dokujiUrl['map01']
      },
      set(value) {
        this.$store.state.info.dokujiUrl['map01'] = value
        permalink.moveEnd()
      }
    },
  },
  methods: {
    toroku: function() {

      this.$store.state.base.layerLists['map01'] = this.$store.state.base.layerLists['map01'].filter((layer) => {
        return layer.layer.values_.source.urls[0] !== this.s_dokujiUrl
      })
      // this.$store.state.base.layerLists['map01'] = this.$store.state.base.layerLists['map01'].filter((layer) => {
      //   return layer.id !== 'dokuji00'
      // })

      layers.dokujiLayerTsuika(0)
      // console.log(this.$store.getters['base/layerList']('map01'))
      layers.dokujiObjAr[0].map01.getSource().setUrl(this.s_dokujiUrl)
      layers.dokujiObjAr[0].map02.getSource().setUrl(this.s_dokujiUrl)
      this.$store.commit('base/unshiftLayerList', {
        value: {
          id: 'dokuji00',
          multipli: false,
          check: true,
          title: this.s_dokujiName,
          layer: layers.dokujiObjAr[0],
          opacity: 1,
          // zoom:13,
          // center:node.data.center,
          addFlg:true,
          summary: '',
          // component: node.data.component
        },
        mapName: 'map01'
      });

      // console.log(this.$store.getters['base/layerList']('map01'))

    },
    onInput: function() {
      // console.log(this.s_dokujiUrl)
      // const map = store.state.base.maps[this.mapName];
      // const result = this.s_layerList.find((el) => el.id === 'dokuji');
      // console.log(result.layer.getSource())
      // result.layer.getSource().setUrl(this.s_dokujiUrl)
      // result.layer.getSource().changed()
      // map.render();
    }

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
