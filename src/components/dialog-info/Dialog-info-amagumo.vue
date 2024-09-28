<template>
  <div class="content-div">
    <p v-html="item.title"></p><hr>
    <div style="">
      <span v-html="s_time"></span>
      <input type="range" min="0" max="48" step="1" class="amagumo-range" v-model.number="s_amagumoTime" />
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
import * as permalink from '@/js/permalink'

export default {
  name: "Dialog-info-amagumo",
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
      if (this.$store.state.info.amagumoTime[this.mapName] <= 37) {
        return this.$store.state.info.time[this.mapName]
      } else {
        return '<span style="color: blue">' + this.$store.state.info.time[this.mapName] + '</span>'
      }
    },
    s_amagumoTime: {
      get() {
        // 37
        return this.$store.state.info.amagumoTime[this.mapName]
      },
      set(value) {
        const basetime = this.$store.state.info.amagumoTimes[value].basetime
        const validtime = this.$store.state.info.amagumoTimes[value].validtime
        this.$store.state.info.amagumoTime[this.mapName] = value
        let url
        if (Number(validtime) < Number(basetime)) {
          url = 'https://www.jma.go.jp/bosai/jmatile/data/nowc/' + validtime + '/none/' + validtime + '/surf/hrpns/{z}/{x}/{y}.png'
        } else {
          url = 'https://www.jma.go.jp/bosai/jmatile/data/nowc/' + basetime + '/none/' + validtime + '/surf/hrpns/{z}/{x}/{y}.png'
        }
        Layers.nowCastObj[this.mapName].getSource().setUrl(url)
        Layers.nowCastMonoObj[this.mapName].getSource().setUrl(url)
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
        this.$store.state.info.time[this.mapName] =  nen2 + tuki2 + hi2 + ' ' + ji2 + fun2
      }
    },
  },
  methods: {
    renzokuChange () {
      const vm = this
      if (this.renzoku) {
        let count = 0;
        interval = setInterval(function() {
          vm.s_amagumoTime = count
          count++
          if (count >= vm.$store.state.info.amagumoTimes.length) {
            count = 0
          }
        }, 100);
      } else {
        clearInterval(interval)
      }
    },
    selectChange (value) {
      this.storeUpdate()
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
