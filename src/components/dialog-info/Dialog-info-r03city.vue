<template>
  <div class="content-div">
    <p v-html="item.title"></p>
    <hr>
    <div style="">
      色分け選択
      <b-form-select v-model="s_selectColor" :options="options" @change="selectChange"></b-form-select>
    </div>
    <div style="margin-top: 5px;">市町村名、郡名、県名で抽出</div>
    <b-form-input type='text' v-model="s_sichosonmei" placeholder="空白でor抽出"></b-form-input>
    <hr>
    <div>
      出典:<span v-html="item.summary"></span>
    </div>
  </div>
</template>

<script>
import * as LayersMvt from '@/js/layers-mvt'
import * as permalink from '@/js/permalink'

export default {
  name: "Dialog-info-r03city",
  props: ['mapName', 'item'],
  components: {
  },
  data () {
    return {
      options: [
        { value: '標準', text: '標準' },
        { value: '県で色分け', text: '県で色分け' },
        { value: '色なし', text: '色なし' },
      ]
    }
  },
  computed: {
    s_sichosonmei: {
      get() {
        return this.$store.state.info.r03citysichosonmei[this.mapName]
      },
      set(value) {
        this.$store.state.info.r03citysichosonmei[this.mapName] = value
        LayersMvt.cityR03Obj[this.mapName].getSource().changed()
        this.storeUpdate()
      }
    },
    s_selectColor: {
      get() {
        return this.$store.state.info.r03citySelectColor[this.mapName]
      },
      set(value) {
        this.$store.state.info.r03citySelectColor[this.mapName] = value
        LayersMvt.cityR03Obj[this.mapName].getSource().changed()
        this.storeUpdate()
      }
    },
  },
  methods: {
    selectChange (value) {
      LayersMvt.cityR03Obj[this.mapName].getSource().changed()
      this.storeUpdate()
    },
    storeUpdate () {
      const selectColor = this.s_selectColor
      const sichosonmei = this.s_sichosonmei
      this.$store.commit('base/updateListPart',{mapName: this.mapName, id:this.item.id, values: [selectColor,sichosonmei]});
      permalink.moveEnd();
    },
  },
  mounted ()  {
    this.$nextTick(function () {
      LayersMvt.cityR03Obj[this.mapName].getSource().changed()
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
