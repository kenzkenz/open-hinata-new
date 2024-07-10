<template>
  <div class="content-div">
    <p v-html="item.title"></p>
    <hr>
    <div style="">
      色分け選択
      <b-form-select v-model="s_selectColor" :options="options" @change="selectChange"></b-form-select>
    </div>
    <hr>
    <div v-if="s_selectColor === '藩で色分け2'">
      <hr>
      <p>「藩で色分け2」の凡例</p>
      <ul>
        <li>皇室領と社寺領＝黒</li>
        <li>幕府領＝赤</li>
        <li>旗本領＝灰</li>
        <li>藩領＝紫</li>
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
        { value: '国で色分け', text: '国で色分け' },
        { value: '色なし', text: '色なし' },
      ]
    }
  },
  computed: {
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
      this.$store.commit('base/updateListPart',{mapName: this.mapName, id:this.item.id, values: [selectColor]});
      permalink.moveEnd();
    },
  },
  mounted ()  {
    this.$nextTick(function () {
      LayersMvt.kinseiPolygonMvtObj[this.mapName].getSource().changed()
    })
  },
  watch: {
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
