<template>
  <div class="content-div">
    <p v-html="item.title"></p><hr>
    <div style="">
      撮影年で抽出 <span v-html="s_year"></span>
      <vue-slider v-model="s_tansyashinSlider"
                  :min="1930"
                  :max="2030"
                  :interval="1"
                  :tooltip-placement="['bottom', 'bottom']"
                  @change="sliderChange"
      ></vue-slider>
      <div style="text-align: right;font-size: small">
      <label :for="'fumei-check-'+ item.component.name">撮影年不明を含む</label><input :id="'fumei-check-'+ item.component.name" type="checkbox" v-model="s_tansyashinFumei" @change="fumeiChange">
      </div>
    </div>
    <hr>
    <div style="">
      撮影機関で抽出
      <b-form-select v-model="s_tansyashin" :options="options" @change="selectChange"></b-form-select>
    </div>
    <hr>
    出典 <span v-html="item.summary"></span>
  </div>
</template>

<script>
import * as LayersMvt from '@/js/layers-mvt'
import * as permalink from '@/js/permalink'

export default {
  name: "Dialog-info-tansyashin",
  props: ['mapName', 'item'],
  components: {
  },
  data () {
    return {
      options: [
        { value: 'all', text: '全て表示' },
        { value: '国土地理院', text: '国土地理院' },
        { value: '陸軍', text: '陸軍' },
        { value: '米軍', text: '米軍' },
      ]
    }
  },
  computed: {
    s_tansyashinFumei: {
      get() {
        return this.$store.state.info.tansyashinFumei[this.mapName]
      },
      set(value) {
        this.$store.state.info.tansyashinFumei[this.mapName] = value
        LayersMvt.tansyashinObj[this.mapName].getSource().changed()
      }
    },
    s_year () {
      const slider = this.$store.state.info.tansyashinSlider[this.mapName]
      return '(' + slider[0] + '〜' + slider[1] + ')'
    },
    s_tansyashin: {
      get() {
        return this.$store.state.info.tansyashin[this.mapName]
      },
      set(value) {
        this.$store.state.info.tansyashin[this.mapName] = value
        LayersMvt.tansyashinObj[this.mapName].getSource().changed()
      }
    },
    s_tansyashinSlider: {
      get() {
        return this.$store.state.info.tansyashinSlider[this.mapName]
      },
      set(value) {
        this.$store.state.info.tansyashinSlider[this.mapName] = value
        LayersMvt.tansyashinObj[this.mapName].getSource().changed()
      }
    },
  },
  methods: {
    fumeiChange (value) {
      LayersMvt.tansyashinObj[this.mapName].getSource().changed()
      this.storeUpdate()
    },
    selectChange (value) {
      LayersMvt.tansyashinObj[this.mapName].getSource().changed()
      this.storeUpdate()
    },
    sliderChange (value) {
      LayersMvt.tansyashinObj[this.mapName].getSource().changed()
      this.storeUpdate()
    },
    storeUpdate () {
      const tansyashin = this.s_tansyashin
      const tansyashinSlider = this.s_tansyashinSlider
      const tansyashinFumei = this.s_tansyashinFumei
      this.$store.commit('base/updateListPart',{mapName: this.mapName, id:this.item.id, values: [tansyashin,tansyashinSlider,tansyashinFumei]});
      permalink.moveEnd();
    },
  },
  mounted ()  {
    this.$nextTick(function () {
      LayersMvt.tansyashinObj[this.mapName].getSource().changed()
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
