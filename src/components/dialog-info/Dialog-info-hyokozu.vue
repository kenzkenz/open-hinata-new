<template>
  <div class="content-div">
    <div style="position: relative">
      <b-button class='olbtn' size="sm" @click="reply"><i class="fa-sharp fa-solid fa-reply-all hover"></i></b-button>
      <b-button style="margin-left: 5px;" class='olbtn' size="sm" @click="auto">自動</b-button>
      <b-form-checkbox class='check-box-gradation' v-model="s_gradationCheck">グラデーション</b-form-checkbox>
    </div>
    <hr>
    <div v-for="(div,index) in s_divs[mapName]" v-bind:key="div.id" class="hyoko-div">
      <div class="m-start-div" v-if="s_divs[mapName][index - 1]">{{ s_divs[mapName][index - 1].m + '〜' }}</div>
      <div class= "input-m-div" v-if="index !== s_divs[mapName].length - 1">
        <input :id="mapName + '-input-' + div.id" class= "input-m" :value="div.m" @input="div.m = Number($event.target.value);inputM()" @change="changeM(index,div)" type="number" step="0.1">
      </div>
      <div :id="mapName + '-div-color-' + div.id" class="div-color" :style="{ 'background-color': div.rgb }" @click="openDialog(div)"></div>
      <b-button v-if="index !== s_divs[mapName].length - 1" class='olbtn delete-btn' size="sm" @click="deleteDiv(div.id)"><i class="fa-sharp fa-solid fa-trash-arrow-up hover"></i></b-button>
      <b-button v-if="index !== s_divs[mapName].length - 1" class='olbtn tsuika-btn' size="sm" @click="appendDiv(div.id)"><i class="fa-sharp fa-solid fa-plus hover"></i></b-button>
    </div>

    <modal name="modal-auto" width="300" height="350" :clickToClose="false">
      <div class="dialog-close-btn-div" @click="autoCansel"><i class="fa-solid fa-xmark hover close-btn"></i></div>
      <div class="modal-body">
        <ul>
          <li>画面中心を基準に12段階の標高図を自動作成します。</li>
        </ul>
        <b-form-select v-model="kizami" :options="options" @change="auto2()"></b-form-select>
        <br><br>
        <hr>
        <br>
        <ul>
          <li>画面中心を基準に7段階の標高図を自動作成します。</li>
        </ul>
        <b-button style="margin-top: 0px;" class='olbtn' v-on:click="auto3()">7段階標高図</b-button>
      </div>
    </modal>

<!--    <div>-->
<!--      出典:<span v-html="item.summary"></span>-->
<!--    </div>-->
  </div>
</template>

<script>
import * as Layer from '@/js/layers'
import * as permalink from '@/js/permalink'
import * as d3 from "d3"
import * as MyMap from "@/js/mymap";

export default {
  name: "Dialog-info-hyokozu",
  props: ['mapName', 'item'],
  components: {
  },
  data () {
    return {
      kizami : '',
      options: [
        { value: '', text: '選択してください。' },
        { value: '0.1m', text: '0.1m刻み' },
        { value: '0.5m', text: '0.5m刻み' },
        { value: '1m', text: '1m刻み' },
        { value: '5m', text: '5m刻み' },
        { value: '10m', text: '10m刻み' },
        { value: '15m', text: '15m刻み' },
        { value: '50m', text: '50m刻み' },
      ],
    }
  },
  computed: {
    s_dialogMaxZindex () { return this.$store.state.base.dialogMaxZindex},
    s_dialogs () { return this.$store.state.base.dialogs},
    s_divs () { return this.$store.state.info.divs},
    s_gradationCheck: {
      get() {
        return this.$store.state.info.gradationCheck[this.mapName]
      },
      set(value) {
        this.$store.state.info.gradationCheck[this.mapName] = value
        this.colorChange()
      }
    },
  },
  methods: {
    auto () {
      const centerHyoko = this.$store.state.base.hyokou
      if (centerHyoko < 0) {
        alert('中心の標高が0m以下です。標高図を作れません。')
        return
      }
      this.$modal.show('modal-auto')
    },
    auto2 () {
      if(!this.kizami) return
      const centerHyoko = this.$store.state.base.hyokou
      let firstM
      let bai
      switch (this.kizami) {
        case '0.1m':
          firstM = Math.floor((centerHyoko * 10)) / 10 + 0.1
          bai = 0.02
          break
        case '0.5m':
          // firstM = Math.round(Math.floor(centerHyoko)/10) * 10 + 0.5
          firstM = Math.floor((centerHyoko * 10)) / 10 + 0.5
          bai = 0.1
          break
        case '1m':
          // firstM = Math.round(Math.floor(centerHyoko)/10) * 10 + 1
          firstM = Math.floor((centerHyoko * 10)) / 10 + 1
          bai = 0.2
          break
        case '5m':
          firstM = Math.round(Math.floor(centerHyoko)/10) * 10 + 5
          bai = 1
          break
        case '10m':
          firstM = Math.round(Math.floor(centerHyoko)/10) * 10 + 10
          bai = 2
          break
        case '15m':
          firstM = Math.round(Math.floor(centerHyoko)/10) * 10 + 15
          bai = 3
          break
        case '50m':
          firstM = Math.round(Math.floor(centerHyoko)/10) * 10 + 50
          bai = 10
          break
      }
      const aaa =
          [
            { id: 0, rgb: 'rgb(0,0,255)', m: firstM + 0 },
            { id: 1, rgb: 'rgb(0,100,255)', m: firstM + (5 * bai) },
            { id: 2, rgb: 'rgb(75,153,238)', m: firstM + (10 * bai) },
            { id: 3, rgb: 'rgb(116,235,244)', m: firstM + (15 * bai) },
            { id: 4, rgb: 'rgb(176,252,79)', m: firstM + (20 * bai) },
            { id: 5, rgb: 'rgb(254,254,84)', m: firstM + (25 * bai) },
            { id: 6, rgb: 'rgb(241,152,55)', m: firstM + (30 * bai) },
            { id: 7, rgb: 'rgb(241,113,55)', m: firstM + (35 * bai) },
            { id: 8, rgb: 'rgb(224,74,74)', m: firstM + (40 * bai) },
            { id: 9, rgb: 'rgb(193,50,50)', m: firstM + (45 * bai) },
            { id: 10, rgb: 'rgb(173,10,10)', m: firstM + (50 * bai) },
            { id: 9999, rgb: 'rgb(144,7,17)', m: 9999},
          ]
      this.s_divs[this.mapName] = aaa
      this.colorChange()
    },
    auto3 () {
      const centerHyoko = this.$store.state.base.hyokou
      let firstM = Math.round(Math.floor(centerHyoko)/10) * 10 + 5
      const aaa =
          [
              { id: 0, rgb: 'rgb(13,13,237)', m: firstM },
              { id: 1, rgb: 'rgb(75,153,238)', m: firstM + 5 },
              { id: 2, rgb: 'rgb(116,235,244)', m: firstM + 45 },
              { id: 3, rgb: 'rgb(176,252,79)', m: firstM + 95 },
              { id: 4, rgb: 'rgb(254,254,84)', m: firstM + 495 },
              { id: 5, rgb: 'rgb(241,152,55)', m: firstM + 1495 },
              { id: 9999, rgb: 'rgb(234,92,50)', m: 9999},
          ]
      this.s_divs[this.mapName] = aaa
      this.colorChange()
    },
    autoCansel () {
      this.$modal.hide('modal-auto')
    },
    colorChange () {
      // --------------------------------------------------------------------
      let divs2 = JSON.parse(JSON.stringify(this.s_divs[this.mapName]))
      divs2.forEach((div) => {
        div.m = div.m * 10
        div.rgb = d3.rgb(div.rgb)
      })
      divs2 = divs2.filter((div) => {
        return div.id !== 9999
      })
      this.$store.state.info.divs2[this.mapName] = divs2
      //-----------------------
      let divs = JSON.parse(JSON.stringify(this.s_divs[this.mapName]))
      divs.sort(function(a, b) {
        if (a.m > b.m) {
          return 1;
        } else {
          return -1;
        }
      })
      const aaa = divs.find((div) => {
        return div.id === 9999
      })
      this.$store.state.info.maxRgb[this.mapName] = d3.rgb(aaa.rgb)
      divs = divs.filter((div) => {
        return div.id !== 9999
      })
      const maxM = d3.max(divs, function(d){ return d.m; }) * 10
      this.$store.state.info.maxM[this.mapName] = maxM
      const minM = d3.min(divs, function(d){ return d.m; })
      const mArr = divs.map((v) => {
        return v.m * 10
      })
      const rgbArr = divs.map((v) => {
        return v.rgb
      })
      const hyokozuColor = d3.scaleLinear().domain(mArr).range(rgbArr)
      this.$store.state.info.hyokozuColors[this.mapName] = []
      for (let i = 0; i < maxM; i++) {
        this.$store.state.info.hyokozuColors[this.mapName][i] = d3.rgb(hyokozuColor(i))
      }
      Layer.hyokozu1Obj[this.mapName].getSource().changed()
      Layer.hyokozu2Obj[this.mapName].getSource().changed()
      permalink.moveEnd()
      //------------------------------------------------------------------
    },
    openDialog (div) {
      const dialog = this.s_dialogs['dialogColor'][this.mapName]
      const element = document.querySelector('#' + this.mapName + '-div-color-' + div.id)

      let left
      if (this.mapName === 'map01') {
        left = element.getBoundingClientRect().right + 'px'
      } else {
        left = element.getBoundingClientRect().right - (window.innerWidth / 2) + 'px'
      }

      dialog.style.right = ''
      dialog.style.left = left
      dialog.style.top = element.getBoundingClientRect().top + 'px'
      this.$store.commit('base/incrDialogMaxZindex');
      dialog.style["z-index"] = this.s_dialogMaxZindex;
      dialog.style.display = 'block'
      this.$store.state.base.editDiv = div
      this.$store.state.base.editMap = this.mapName
      let color = div.rgb
      const rgba = d3.rgb(color)
      const colorP = { r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.opacity }
      this.$store.state.base.editFeatureColor[this.mapName] = colorP
    },
    reply () {
      const result = window.confirm('初期値に戻しますか。')
      if (!result) return
      this.$store.state.info.divs[this.mapName] = JSON.parse(JSON.stringify(this.$store.state.info.divsDefault[this.mapName]))
      this.colorChange()
    },
    inputM () {
      this.colorChange()
    },
    changeM (index,div) {
      if (this.s_divs[this.mapName][index].m < 0 ) this.s_divs[this.mapName][index].m = 0

      // let prevM
      // if (index === 0) {
      //   prevM = -0.1
      // } else {
      //   prevM = this.s_divs[this.mapName][index - 1].m
      // }
      // if (div.m <= prevM) {
      //   this.s_divs[this.mapName][index].m = prevM + 0.1
      // }
      // const nextM = this.s_divs[this.mapName][index + 1].m
      // if (div.m >= nextM) {
      //   this.s_divs[this.mapName][index].m = nextM - 0.1
      // }

      // 上下とちらかを使う。もしくは使わない。

      // this.s_divs[this.mapName].sort(function(a, b) {
      //   if (a.m > b.m) {
      //     return 1;
      //   } else {
      //     return -1;
      //   }
      // })

      this.colorChange()
    },
    deleteDiv (id) {
      if (this.s_divs[this.mapName].length > 3) {
        this.s_divs[this.mapName] = this.s_divs[this.mapName].filter((div) => {
          return div.id !== id
        })
        this.colorChange()
      } else {
        alert('これ以上削除できません。')
      }
    },
    appendDiv (id) {
      let maxId = d3.max(this.s_divs[this.mapName], function(d){ return d.id; })
      let order
      this.s_divs[this.mapName].find((div,i) => {
        order = i
        return div.id === id
      })
      if (order !== this.s_divs[this.mapName].length-2) {
        const tyukan = this.s_divs[this.mapName][order].m + (this.s_divs[this.mapName][order + 1].m - this.s_divs[this.mapName][order].m) / 2
        this.s_divs[this.mapName].splice(order + 1, 0, { id: maxId + 1, rgb: this.s_divs[this.mapName][order].rgb, m: tyukan })
      } else {
        console.log(this.s_divs)
        const saigo = this.s_divs[this.mapName][order].m + this.s_divs[this.mapName][order].m - this.s_divs[this.mapName][order-1].m
        console.log(saigo)
        this.s_divs[this.mapName].push({id: maxId + 1, rgb: this.s_divs[this.mapName][order].rgb, m: saigo})
        this.s_divs[this.mapName].sort(function(a, b) {
          if (a.m > b.m) {
            return 1;
          } else {
            return -1;
          }
        })
      }
      this.colorChange()
    },
    storeUpdate () {
      const syurui = this.s_iryoukikansyurui
      const kamoku = this.s_iryoukikankamoku
      this.$store.commit('base/updateListPart',{mapName: this.mapName, id:this.item.id, values: [syurui,kamoku]});
      permalink.moveEnd()
    },
  },
  watch: {
    divs(newValue) {
      // console.log(newValue)
    },
  },
  created () {
    // this.divsDefault = JSON.parse(JSON.stringify(this.$store.state.info.divs))
  },
  mounted () {
    this.colorChange()
  }
}
</script>

<style scoped>
.check-box-gradation {
  position:absolute;
  left:90px;
  top:0;
}
.hyoko-div {
  height: 35px;
  position: relative;
}
.m-start-div {
  position: absolute;
  left: 0px;
  top:4px;
  width: 50px;
  text-align: right;
}
.input-m-div {
  position: absolute;
  left: 55px;
  top:0px;
}
.input-m {
  width: 65px;
  text-align: right;
}
.div-color {
  position: absolute;
  left: 125px;
  top:0;
  height: 28px;
  width:40px;
  cursor: pointer;
}
.tsuika-btn {
  position: absolute;
  right: 0;
  top:0;
}
.delete-btn {
  position: absolute;
  right: 32px;
  top:0;
}
.content-div{
  width: 250px;
  /*height: 390px;*/
  padding: 10px;
}
.modal-body{
  width: 95%;
}
.dialog-close-btn-div {
  position: absolute;
  top: 2px;
  right: 12px;
  cursor: pointer;
  z-index: 2;
  font-size:1.5em;
}
ul {
  margin-left: -30px
}
</style>
