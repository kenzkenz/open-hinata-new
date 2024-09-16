<template>
  <div class="content-div">
    <p v-html="item.title"></p><hr>
    <div style="">
      <span v-html="s_timeH"></span>
      <input type="range" min="0" max="212" step="1" class="himawari-range" v-model.number="s_himawariTime" />
      <b-form-select v-model="type" :options="options" @change="selectChange"></b-form-select>
    </div>
    <hr>
  </div>
</template>

<script>
import * as Layers from '@/js/layers'
import * as permalink from '@/js/permalink'
export default {
  name: "Dialog-info-himawari",
  props: ['mapName', 'item'],
  components: {
  },
  data () {
    return {
      type:'B13/TBB',
      options: [
        { value: 'B13/TBB', text: '赤外画像' },
        { value: 'B03/ALBD', text: '可視画像' },
        { value: 'B08/TBB', text: '水蒸気画像' },
        { value: 'REP/ETC', text: 'トゥルーカラー再現画像' },
        { value: 'SND/ETC', text: '雲頂強調画像' },
      ]
    }
  },
  computed: {
    s_timeH () {
      return this.$store.state.info.timeH[this.mapName]
    },
    s_himawariTime: {
      get() {
        // 37
        return this.$store.state.info.himawariTime[this.mapName]
      },
      set(value) {
        const basetime = this.$store.state.info.himawariTimes[value].basetime
        const validtime = this.$store.state.info.himawariTimes[value].validtime
        this.$store.state.info.himawariTime[this.mapName] = value
        // const url = 'https://www.jma.go.jp/bosai/himawari/data/satimg/' + basetime + '/jp/' + basetime + '/REP/ETC/{z}/{x}/{y}.jpg'
        const url = 'https://www.jma.go.jp/bosai/himawari/data/satimg/' + basetime + '/jp/' + basetime + '/' + this.type + '/{z}/{x}/{y}.jpg'

        Layers.himawariObj[this.mapName].getSource().setUrl(url)
        // -----------------------------------------------------------
        const t = validtime
        const nen = t.slice(0,4)
        const tuki = t.slice(4,6) - 1
        const hi = t.slice(6,8)
        let ji = Number(t.slice(8,10))
        const fun = t.slice(10,12)
        const date = new Date(nen,tuki,hi,ji,fun,0)
        date.setHours(date.getHours() + 9)
        const tukihi = date.toLocaleDateString()
        const time = date.toLocaleTimeString()
        const nen2 = tukihi.split('/')[0] + '年'
        const tuki2 = tukihi.split('/')[1] + '月'
        const hi2 = tukihi.split('/')[2] + '日'
        const ji2 = time.split(':')[0] + '時'
        const fun2 = time.split(':')[1] + '分'
        this.$store.state.info.timeH[this.mapName] =  nen2 + tuki2 + hi2 + ' ' + ji2 + fun2
      }
    },
  },
  methods: {
    selectChange (value) {
      const basetime = this.$store.state.info.himawariTimes[this.s_himawariTime].basetime
      const url = 'https://www.jma.go.jp/bosai/himawari/data/satimg/' + basetime + '/jp/' + basetime + '/' + value + '/{z}/{x}/{y}.jpg'
      Layers.himawariObj[this.mapName].getSource().setUrl(url)

    },
    storeUpdate () {
      const amagumoTime = this.s_amagumoTime
      console.log(amagumoTime,this.item.id)
      this.$store.commit('base/updateListPart',{mapName: this.mapName, id:this.item.id, values: [amagumoTime]});
      permalink.moveEnd();
    },
  },
  mounted ()  {
    // const overPassSource = new Overpass({
    //   filter: this.s_op.split(','),
    //   strategy: tile(createXYZ({ minZoom: 14, maxZoom: 14, tileSize:512  })),
    // })
    // LayersMvt.opObj[this.mapName].setSource(overPassSource)
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
