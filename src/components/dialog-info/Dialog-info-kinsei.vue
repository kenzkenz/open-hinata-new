<template>
  <div class="content-div">
    <p v-html="item.title"></p>
    <hr>
    <div style="">
      色分け選択
      <b-form-select v-model="s_selectColor" :options="options" @change="selectChange"></b-form-select>
    </div>
    <div style="margin-top: 5px;">村名、よみ、領分などで抽出</div>
    <b-form-input type='text' v-model="s_sonmei" placeholder="空白でor抽出"></b-form-input>

    <div style="margin-top: 15px;">
      <b-form-checkbox type="checkbox" v-model="s_aikyuson">
        相給村を抽出　<a href="https://ja.wikipedia.org/wiki/%E7%9B%B8%E7%B5%A6" target="_blank">相給とは</a>
      </b-form-checkbox>
    </div>
    <hr>
    <div v-if="s_selectColor === '藩で色分け2'">
      <p>「藩で色分け2」の凡例</p>
      <ul>
        <li>皇室領＝黄</li>
        <li>社寺領＝黒</li>
        <li>幕　領＝赤</li>
        <li>旗本領＝灰</li>
        <li>藩　領＝紫</li>
        <li>その他＝青</li>
      </ul>
    </div>
    <div>
      出典 <span v-html="item.summary"></span>
    </div>
  </div>
</template>

<script>
import * as LayersMvt from '@/js/layers-mvt'
import * as permalink from '@/js/permalink'

export default {
  name: "Dialog-info-kinsei",
  props: ['mapName', 'item'],
  components: {
  },
  data () {
    return {
      options: [
        { value: '標準', text: '標準' },
        { value: '藩で色分け', text: '藩で色分け' },
        { value: '藩で色分け2', text: '藩で色分け2' },
        { value: '国で色分け', text: '国（令制国）で色分け' },
        { value: '県で色分け', text: '県で色分け' },
        { value: '郡で色分け', text: '郡で色分け' },
        { value: '石高で色分け', text: '石高（面積割）で色分け' },
        { value: '石高で色分け2', text: '石高で色分け' },
        { value: '色なし', text: '色なし' },
      ]
    }
  },
  computed: {
    s_aikyuson: {
      get() {
        return this.$store.state.info.aikyuson[this.mapName]
      },
      set(value) {
        // console.log(value)
        this.$store.state.info.aikyuson[this.mapName] = value
        LayersMvt.kinseiPolygonMvtObj[this.mapName].getSource().changed()
        this.storeUpdate()
        // if (value) {
        //   if (window.innerWidth > 1000) {
        //     LayersMvt.kinseiPolygonMvtObj[this.mapName].setMaxResolution(156543.03)
        //     LayersMvt.kinseiPolygonRasterObj[this.mapName].setMinResolution(156543.03)
        //   }
        // } else {
        //   if (!this.s_sonmei) {
        //     if (window.innerWidth > 1000) {
        //       LayersMvt.kinseiPolygonMvtObj[this.mapName].setMaxResolution(611.496226)	 //zoom8
        //       LayersMvt.kinseiPolygonRasterObj[this.mapName].setMinResolution(611.496226)
        //     }
        //   }
        // }
      }
    },
    s_sonmei: {
      get() {
        return this.$store.state.info.sonmei[this.mapName]
      },
      set(value) {
        // console.log(value)
        this.$store.state.info.sonmei[this.mapName] = value
        LayersMvt.kinseiPolygonMvtObj[this.mapName].getSource().changed()
        this.storeUpdate()
        // if (value) {
        //   if (window.innerWidth > 700) {
        //     LayersMvt.kinseiPolygonMvtObj[this.mapName].setMaxResolution(156543.03)
        //     LayersMvt.kinseiPolygonRasterObj[this.mapName].setMinResolution(156543.03)
        //   }
        // } else {
        //   if (!this.s_aikyuson) {
        //     if (window.innerWidth > 700) {
        //       LayersMvt.kinseiPolygonMvtObj[this.mapName].setMaxResolution(611.496226)	 //zoom8
        //       LayersMvt.kinseiPolygonRasterObj[this.mapName].setMinResolution(611.496226)
        //     }
        //   }
        // }
      }
    },
    s_selectColor: {
      get() {
        return this.$store.state.info.selectColor[this.mapName]
      },
      set(value) {
        this.$store.state.info.selectColor[this.mapName] = value
        LayersMvt.kinseiPolygonMvtObj[this.mapName].getSource().changed()
      }
    },
  },
  methods: {
    selectChange (value) {
      LayersMvt.kinseiPolygonMvtObj[this.mapName].getSource().changed()
      this.storeUpdate()
    },
    storeUpdate () {
      const selectColor = this.s_selectColor
      const sonmei = this.s_sonmei
      const aikyuson = this.s_aikyuson
      this.$store.commit('base/updateListPart',{mapName: this.mapName, id:this.item.id, values: [selectColor,sonmei,aikyuson]});
      permalink.moveEnd();
    },
  },
  mounted ()  {
    console.log(this.s_sonmei)
    // if (this.s_sonmei || this.s_aikyuson) {
    //   if (window.innerWidth > 700) {
    //     LayersMvt.kinseiPolygonMvtObj[this.mapName].setMaxResolution(156543.03)
    //     LayersMvt.kinseiPolygonRasterObj[this.mapName].setMinResolution(156543.03)
    //   }
    // }
    this.$nextTick(function () {
      LayersMvt.kinseiPolygonMvtObj[this.mapName].getSource().changed()
    })
  },
  watch: {
    s_sonmei(newValue, oldValue) {
    }
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
