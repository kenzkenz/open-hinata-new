<template>
  <div class="content-div">
    <p v-html="item.title"></p><hr>
    <div style="text-align: center;">
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
    s_tansyashin: {
      get() {
        return this.$store.state.info.tansyashin[this.mapName]
      },
      set(value) {
        this.$store.state.info.tansyashin[this.mapName] = value
        LayersMvt.tansyashinObj[this.mapName].getSource().changed()
      }
    },
  },
  methods: {
    selectChange (value) {
      LayersMvt.tansyashinObj[this.mapName].getSource().changed()
      this.storeUpdate()
    },
    storeUpdate () {
      const tansyashin = this.s_tansyashin
      this.$store.commit('base/updateListPart',{mapName: this.mapName, id:this.item.id, values: [tansyashin]});
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
