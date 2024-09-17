<template>
  <div class="content-div">
    <p v-html="item.title"></p><hr>
    <div style="">
      フィルター
      <b-form-select v-model="s_op" :options="options" @change="selectChange"></b-form-select>
    </div>
    <hr>
    ズーム14以上で表示します。
  </div>
</template>

<script>
import * as LayersMvt from '@/js/layers-mvt'
import * as permalink from '@/js/permalink'
import Overpass from 'ol-ext/source/Overpass'
import {tile} from 'ol/loadingstrategy'
import {createXYZ} from "ol/tilegrid"
export default {
  name: "Dialog-info-op",
  props: ['mapName', 'item'],
  components: {
  },
  data () {
    return {
      options: [
        { value: 'highway', text: '道路' },
        { value: 'highway=bus_stop', text: 'バス停' },
        { value: 'railway', text: '鉄道' },
        { value: 'leisure', text: 'レジャー' },
        { value: 'natural', text: '自然物' },
        { value: 'historic=tomb', text: '歴史的な墓' },
        { value: 'emergency=defibrillator', text: 'AED' },
      ]
    }
  },
  computed: {
    s_op: {
      get() {
        return this.$store.state.info.op[this.mapName]
      },
      set(value) {
        this.$store.state.info.op[this.mapName] = value
      }
    },

  },
  methods: {
    selectChange (value) {
        // console.log('filter:',filter.split(','))
      const overPassSource = new Overpass({
        filter: value.split(','),
        strategy: tile(createXYZ({ minZoom: 14, maxZoom: 14, tileSize:512  })),
      })
      LayersMvt.opObj[this.mapName].setSource(overPassSource)
      this.storeUpdate()
    },
    storeUpdate () {
      const op = this.s_op
      this.$store.commit('base/updateListPart',{mapName: this.mapName, id:this.item.id, values: [op]});
      permalink.moveEnd();
    },
  },
  mounted ()  {
    const overPassSource = new Overpass({
      filter: this.s_op.split(','),
      strategy: tile(createXYZ({ minZoom: 14, maxZoom: 14, tileSize:512  })),
    })
    LayersMvt.opObj[this.mapName].setSource(overPassSource)
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
