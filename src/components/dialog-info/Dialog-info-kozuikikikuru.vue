<template>
  <div class="content-div">
    <p v-html="item.title"></p><hr>
    <div style="">
      <span v-html="s_time"></span>
      <input type="range" min="0" max="37" step="1" v-model.number="s_kozuikikuruTime" />
      <b-form-checkbox v-model="renzoku" @change="renzokuChange" switch>
        連続
      </b-form-checkbox>
    </div>
    <hr>
    <a href="https://www.jma.go.jp/bosai/nowc/" target="_blank">気象庁ナウキャスト</a>
  </div>
</template>

<script>
let interval
import * as Layers from '@/js/layers'

export default {
  name: "Dialog-info-kozuikikikuru",
  props: ['mapName', 'item'],
  components: {
  },
  data () {
    return {
      renzoku: false
    }
  },
  computed: {
    s_time () {
      return this.$store.state.info.timeK[this.mapName]
    },
    s_kozuikikuruTime: {
      get() {
        // 37
        return this.$store.state.info.kozuikikikuruTime[this.mapName]
      },
      set(value) {
        if (this.$store.state.info.kozuikikikuruTimes[value]) {
          const basetime = this.$store.state.info.kozuikikikuruTimes[value].basetime
          this.$store.state.info.kozuikikikuruTime[this.mapName] = value
          const url = 'https://www.jma.go.jp/bosai/jmatile/data/risk/' + basetime + '/immed0/' + basetime + '/surf/flood/{z}/{x}/{y}.pbf'
          Layers.kozuikikikuruObj[this.mapName].getSource().setUrl(url)
          Layers.kozuikikikuruObj[this.mapName].getSource().setUrl(url)
          // -----------------------------------------------------------
          const t = basetime
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
          this.$store.state.info.timeK[this.mapName] =  nen2 + tuki2 + hi2 + ' ' + ji2 + fun2
        }
      }
    },
  },
  methods: {
    renzokuChange () {
      const vm = this
      if (this.renzoku) {
        let count = vm.s_kozuikikuruTime
        interval = setInterval(function() {
          vm.s_kozuikikuruTime = count
          count++
          if (count >= vm.$store.state.info.kozuikikikuruTimes.length) {
            count = 0
          }
        }, 100)
      } else {
        clearInterval(interval)
      }
    },
  },
  mounted ()  {
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
