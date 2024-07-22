<template>
  <div class="content-div">
    <p v-html="item.title"></p>
    <hr>
    <div style="">
      種類で選択
      <b-form-select v-model="s_iryoukikansyurui" :options="options" @change="selectChange"></b-form-select>
    </div>
    <div style="margin-top: 5px;">科目で抽出</div>
    <b-form-input type='text' v-model="s_iryoukikankamoku" placeholder="科目"></b-form-input>
    <hr>
    <div>
      出典:<span v-html="item.summary"></span>
    </div>
  </div>
</template>

<script>
import * as LayersMvt from '@/js/layers-mvt'
import * as permalink from '@/js/permalink'
import {iryoMvtObj, iryoRasterObj} from "@/js/layers-mvt";

export default {
  name: "Dialog-info-r05city",
  props: ['mapName', 'item'],
  components: {
  },
  data () {
    return {
      options: [
        { value: 0, text: '全て' },
        { value: 1, text: '病院' },
        { value: 2, text: '診療所' },
        { value: 3, text: '歯科診療所' },
      ]
    }
  },
  computed: {
    s_iryoukikankamoku: {
      get() {
        return this.$store.state.info.iryoukikankamoku[this.mapName]
      },
      set(value) {
        this.$store.state.info.iryoukikankamoku[this.mapName] = value
        LayersMvt.iryoMvtObj[this.mapName].getSource().changed()
        this.storeUpdate()
        console.log(value)
        if (value) {
          if (window.innerWidth > 1000) {
            LayersMvt.iryoMvtObj[this.mapName].setMaxResolution(156543.03)
            LayersMvt.iryoRasterObj[this.mapName].setMinResolution(156543.03)
          }
        } else if (!value && this.s_iryoukikansyurui === 0) {
          if (window.innerWidth > 1000) {
            LayersMvt.iryoMvtObj[this.mapName].setMaxResolution(152.874057)	 //zoom10
            LayersMvt.iryoRasterObj[this.mapName].setMinResolution(152.874057)
          }
        }
      }
    },
    s_iryoukikansyurui: {
      get() {
        return this.$store.state.info.iryoukikansyurui[this.mapName]
      },
      set(value) {
        this.$store.state.info.iryoukikansyurui[this.mapName] = value
        LayersMvt.iryoMvtObj[this.mapName].getSource().changed()
        this.storeUpdate()
        console.log(value)
        if (value !== 0) {
          if (window.innerWidth > 1000) {
            LayersMvt.iryoMvtObj[this.mapName].setMaxResolution(156543.03)
            LayersMvt.iryoRasterObj[this.mapName].setMinResolution(156543.03)
          }
        } else if (value === 0 && !this.s_iryoukikankamoku) {
          if (window.innerWidth > 1000) {
            LayersMvt.iryoMvtObj[this.mapName].setMaxResolution(152.874057)	 //zoom10
            LayersMvt.iryoRasterObj[this.mapName].setMinResolution(152.874057)
          }
        }
      }
    },
  },
  methods: {
    selectChange (value) {
      LayersMvt.iryoMvtObj[this.mapName].getSource().changed()
      this.storeUpdate()
    },
    storeUpdate () {
      const syurui = this.s_iryoukikansyurui
      const kamoku = this.s_iryoukikankamoku
      this.$store.commit('base/updateListPart',{mapName: this.mapName, id:this.item.id, values: [syurui,kamoku]});
      permalink.moveEnd();
    },
  },
  mounted ()  {
    console.log((this.s_iryoukikansyurui))
    if (this.s_iryoukikansyurui !== 0 || this.s_iryoukikankamoku) {
      if (window.innerWidth > 1000) {
        LayersMvt.iryoMvtObj[this.mapName].setMaxResolution(156543.03)
        LayersMvt.iryoRasterObj[this.mapName].setMinResolution(156543.03)
      }
    }



    this.$nextTick(function () {
      LayersMvt.iryoMvtObj[this.mapName].getSource().changed()
    })
  }
}
</script>

<style scoped>
.content-div{
  width: 250px;
  /*height: 390px;*/
  padding: 10px;
}
</style>
