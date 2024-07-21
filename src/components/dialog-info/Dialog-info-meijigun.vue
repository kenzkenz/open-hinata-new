<template>
  <div class="content-div">
    <p v-html="item.title"></p>
    <hr>
    <div style="">
      色分け選択
      <b-form-select v-model="s_selectColor" :options="options" @change="selectChange"></b-form-select>
    </div>
    <div style="margin-top: 5px;">郡名で抽出</div>
    <b-form-input type='text' v-model="s_gunmei" placeholder="村名"></b-form-input>
    <hr>
    <div>
      <span v-html="item.summary"></span>
    </div>
  </div>
</template>

<script>
import * as LayersMvt from '@/js/layers-mvt'
import * as permalink from '@/js/permalink'
import store from "@/js/store";
import {gunObj} from "@/js/layers-mvt";

export default {
  name: "Dialog-info-maijigun",
  props: ['mapName', 'item'],
  components: {
  },
  data () {
    return {
      options: [
        { value: '標準', text: '標準' },
        { value: '県で色分け', text: '県で色分け' },
        { value: '国で色分け', text: '国で色分け' },
        { value: '色なし', text: '色なし' },
      ]
    }
  },
  computed: {
    s_gunmei: {
      get() {
        return this.$store.state.info.meijigunmei[this.mapName]
      },
      set(value) {
        // console.log(value)
        this.$store.state.info.meijigunmei[this.mapName] = value
        LayersMvt.gunObj[this.mapName].getSource().changed()
        this.storeUpdate()
      }
    },
    s_selectColor: {
      get() {
        return this.$store.state.info.meijigunSelectColor[this.mapName]
      },
      set(value) {
        this.$store.state.info.meijigunSelectColor[this.mapName] = value
        LayersMvt.gunObj[this.mapName].getSource().changed()
      }
    },
  },
  methods: {
    selectChange (value) {
      LayersMvt.gunObj[this.mapName].getSource().changed()
      this.storeUpdate()
    },
    storeUpdate () {
      const selectColor = this.s_selectColor
      const gunmei = this.s_gunmei
      this.$store.commit('base/updateListPart',{mapName: this.mapName, id:this.item.id, values: [selectColor,gunmei]});
      permalink.moveEnd();
    },
  },
  mounted ()  {
    this.$nextTick(function () {
      LayersMvt.gunObj[this.mapName].getSource().changed()
    })
  },
  watch: {
    s_gunmei(newValue, oldValue) {
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
