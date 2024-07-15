<template>
  <v-dialog :dialog="s_dialogDokuji" id="dialog-dokuji">
    <div :style="contentSize">
      名称<br>
      <input type='text' @input="onInput" v-model="s_dokujiName" style="width: 290px;"><br>
      タイルURL<br>
      <input type='text' @input="onInput" v-model="s_dokujiUrl" style="width: 290px;"><br>
      <b-button style="margin-top: 5px;" class="olbtn" size="sm" @click="toroku">追加</b-button>
    </div>
  </v-dialog>
</template>

<script>
import * as MyMap from '../js/mymap'
import {moveEnd} from "@/js/permalink"
import store from "@/js/store";
import * as permalink from "@/js/permalink";
import * as layers from '@/js/layers'
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
        try {
          return layer.layer.values_.source.urls[0] !== this.s_dokujiUrl
        } catch(e) {
          return layer
        }
      })

      const i = this.$store.state.info.dokujiLayers.length
      // alert(i)
      // console.log(this.$store.state.base.layerLists['map01'])
      // this.$store.state.base.layerLists['map01'] = this.$store.state.base.layerLists['map01'].filter((layer) => {
      //   console.log(layer.id,'dokuji' + (i-1))
      //   return layer.id !== 'dokuji' + (i-1)
      // })

      this.$store.state.info.dokujiLayers.push({
        id: 'dokuji' + i,
        url:this.s_dokujiUrl,
        name:this.s_dokujiName,
      })
      layers.dokujiLayerTsuika(i)
      layers.dokujiObjAr[i].map01.getSource().setUrl(this.s_dokujiUrl)
      layers.dokujiObjAr[i].map02.getSource().setUrl(this.s_dokujiUrl)
      console.log(layers.dokujiObjAr[i])
      this.$store.commit('base/unshiftLayerList', {
        value: {
          id: 'dokuji' + i,
          multipli: false,
          check: true,
          title: this.s_dokujiName,
          layer: layers.dokujiObjAr[i],
          opacity: 1,
          addFlg:true,
          summary: '',
          component: {name: 'dokuji', values:[]}
        },
        mapName: 'map01'
      });
    },
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
