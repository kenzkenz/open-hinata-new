<template>
  <div class="content-div">
    <p v-html="item.title"></p><hr>
    <div style="text-align: center;">
      <b-form-select v-model="s_kijyunten" :options="options" @change="selectChange"></b-form-select>
    </div>
    <hr>
    <span v-html="item.summary"></span>
  </div>
</template>

<script>
import * as LayersMvt from '@/js/layers-mvt'
import * as permalink from '@/js/permalink'

export default {
  name: "Dialog-info-kijyunten",
  props: ['mapName', 'item'],
  components: {
  },
  data () {
    return {
      options: [
        { value: 'all', text: '全て表示' },
        { value: '電子基準点', text: '電子基準点' },
        { value: '一等三角点', text: '一等三角点' },
        { value: '二等三角点', text: '二等三角点' },
        { value: '三等三角点', text: '三等三角点' },
        { value: '四等三角点', text: '四等三角点' },
        { value: '準基準水準点', text: '準基準水準点' },
        { value: '一等水準交差点', text: '一等水準交差点' },
        { value: '一等道路水準点', text: '一等道路水準点' },
        { value: '一等水準点', text: '一等水準点' },
        { value: '二等水準点', text: '二等水準点' },
        { value: '二等道路水準点', text: '二等道路水準点' },
      ]
    }
  },
  computed: {
    s_kijyunten: {
      get() {
        return this.$store.state.info.kijyunten[this.mapName]
      },
      set(value) {
        this.$store.state.info.kijyunten[this.mapName] = value
        LayersMvt.kizyuntenObj[this.mapName].getSource().changed()
      }
    },
  },
  methods: {
    selectChange (value) {
      LayersMvt.kizyuntenObj[this.mapName].getSource().changed()
      this.storeUpdate()
    },
    storeUpdate () {
      const kijyunten = this.s_kijyunten
      this.$store.commit('base/updateListPart',{mapName: this.mapName, id:this.item.id, values: [kijyunten]});
      permalink.moveEnd();
    },
  },
  mounted ()  {
    this.$nextTick(function () {
      LayersMvt.kizyuntenObj[this.mapName].getSource().changed()
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
