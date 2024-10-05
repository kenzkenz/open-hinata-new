<template>
  <v-dialog :dialog="s_dialogDokuji" id="dialog-dokuji">
    <div :style="contentSize">
      名称<br>
      <input type='text' v-model="s_dokujiName" style="width: 290px;"><br>
      タイルURL<br>
      <input type='text' v-model="s_dokujiUrl" style="width: 290px;"><br>
<!--      min<br>-->
<!--      <input type='text' v-model="s_dokujiMin" style="width: 50px;"><br>-->

      <b-button style="margin-top: 5px;" class="olbtn" size="sm" @click="toroku">追加</b-button>
      <br>
      <br>
      参考:<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>
    </div>
  </v-dialog>
</template>

<script>
import * as MyMap from '../js/mymap'
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
    s_dokujiMin:{
      get() {
        return this.$store.state.info.dokujiMin['map01']
      },
      set(value) {
        // console.log(this.$store.state.info.dokujiMin['map01'])
        this.$store.state.info.dokujiMin['map01'] = value
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
      this.$store.state.info.dokujiLayers.push({
        id: 'dokuji' + i,
        url:this.s_dokujiUrl,
        name:this.s_dokujiName,
      })
      console.log(this.s_dokujiMin)
      // layers.dokujiLayerTsuika(i,this.s_dokujiMin)
      layers.dokujiLayerTsuika(i)
      layers.dokujiObjAr[i].map01.getSource().setUrl(this.s_dokujiUrl)
      layers.dokujiObjAr[i].map02.getSource().setUrl(this.s_dokujiUrl)
      // layers.dokujiObjAr[i].map01.getSource().setMinZoom(16)
      // layers.dokujiObjAr[i].map02.getSource().setMinZoom(16)


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
