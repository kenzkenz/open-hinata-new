<template>
  <div class="content-div">
<!--    <p v-html="item.title"></p>-->
    <b-button class='olbtn' size="sm" @click="reply"><i class="fa-sharp fa-solid fa-reply-all hover"></i></b-button>
    <b-button style="margin-left: 5px;" class='olbtn' size="sm" @click="kojyun">降準</b-button>
    <b-button style="margin-left: 5px;" class='olbtn' size="sm" @click="syozyun">昇順</b-button>
    <hr>
    <div v-for="(div,index) in s_divs[mapName]" v-bind:key="div.id" class="hyoko-div">
<!--      {{ div.m }}-->
<!--      <b-form-input type='text' :value="div.m" @input="div.m = Number($event.target.value)"></b-form-input>-->

      <!--      <input class= "input-m" :value="div.m" @input="div.m = Number($event.target.value)" @change="changeM" type="number">-->

      <div class="m-start-div" v-if="s_divs[mapName][index - 1]">{{ s_divs[mapName][index - 1].m + '〜' }}</div>

      <div class= "input-m-div">
        <input class= "input-m" :value="div.m" @input="div.m = Number($event.target.value);changeM()"  type="number">
      </div>

      <div :id="mapName + '-div-color-' + div.id" class="div-color" :style="{ 'background-color': div.rgb }" @click="openDialog(div)"></div>

      <b-button class='olbtn delete-btn' size="sm" @click="deleteDiv(div.id)"><i class="fa-sharp fa-solid fa-trash-arrow-up hover"></i></b-button>
      <b-button class='olbtn tsuika-btn' size="sm" @click="appendDiv(div.id)"><i class="fa-sharp fa-solid fa-plus hover"></i></b-button>
    </div>


<!--    <div>-->
<!--      出典:<span v-html="item.summary"></span>-->
<!--    </div>-->
  </div>
</template>

<script>
import * as LayersMvt from '@/js/layers-mvt'
import * as Layer from '@/js/layers'
import * as permalink from '@/js/permalink'
import * as d3 from "d3"
import * as MyMap from "@/js/mymap";
import {Chrome} from 'vue-color'
import store from "@/js/store";
import layer from "@/components/Layer";
import {hyokozu1Obj} from "@/js/layers";

export default {
  name: "Dialog-info-hyokozu",
  props: ['mapName', 'item'],
  components: {
    'chrome-picker': Chrome
  },
  data () {
    return {
      // divs: {},
      divsDefault:{
        map01:
            [
              { id: 0, rgb: 'rgb(13,13,237)', m: 5 },
              { id: 1, rgb: 'rgb(75,153,238)', m: 10 },
              { id: 2, rgb: 'rgb(116,235,244)', m: 50 },
              { id: 3, rgb: 'rgb(176,252,79)', m: 100 },
              { id: 4, rgb: 'rgb(254,254,84)', m: 500 },
              { id: 5, rgb: 'rgb(241,152,55)', m: 1500 },
              { id: 6, rgb: 'rgb(255,0,0)', m: 4000 },
            ],
        map02:
            [
              { id: 0, rgb: 'rgb(13,13,237)', m: 5 },
              { id: 1, rgb: 'rgb(75,153,238)', m: 10 },
              { id: 2, rgb: 'rgb(116,235,244)', m: 50 },
              { id: 3, rgb: 'rgb(176,252,79)', m: 100 },
              { id: 4, rgb: 'rgb(254,254,84)', m: 500 },
              { id: 5, rgb: 'rgb(241,152,55)', m: 1500 },
              { id: 6, rgb: 'rgb(255,0,0)', m: 4000 },
            ]
      },
    }
  },
  computed: {
    s_dialogMaxZindex () { return this.$store.state.base.dialogMaxZindex},
    s_dialogs () { return this.$store.state.base.dialogs},
    s_divs () {
      return this.$store.state.info.divs
    },
    s_iryoukikankamoku: {
      get() {
        return this.$store.state.info.iryoukikankamoku[this.mapName]
      },
      set(value) {
        this.$store.state.info.iryoukikankamoku[this.mapName] = value
        LayersMvt.iryoMvtObj[this.mapName].getSource().changed()
        this.storeUpdate()
        console.log(value)
        if (value) {
          if (window.innerWidth > 1000) {
            LayersMvt.iryoMvtObj[this.mapName].setMaxResolution(156543.03)
            LayersMvt.iryoRasterObj[this.mapName].setMinResolution(156543.03)
          }
        } else if (!value && this.s_iryoukikansyurui === 0) {
          if (window.innerWidth > 1000) {
            LayersMvt.iryoMvtObj[this.mapName].setMaxResolution(152.874057)	 //zoom10
            LayersMvt.iryoRasterObj[this.mapName].setMinResolution(152.874057)
          }
        }
      }
    },
    s_iryoukikansyurui: {
      get() {
        return this.$store.state.info.iryoukikansyurui[this.mapName]
      },
      set(value) {
        this.$store.state.info.iryoukikansyurui[this.mapName] = value
        LayersMvt.iryoMvtObj[this.mapName].getSource().changed()
        this.storeUpdate()
        console.log(value)
        if (value !== 0) {
          if (window.innerWidth > 1000) {
            LayersMvt.iryoMvtObj[this.mapName].setMaxResolution(156543.03)
            LayersMvt.iryoRasterObj[this.mapName].setMinResolution(156543.03)
          }
        } else if (value === 0 && !this.s_iryoukikankamoku) {
          if (window.innerWidth > 1000) {
            LayersMvt.iryoMvtObj[this.mapName].setMaxResolution(152.874057)	 //zoom10
            LayersMvt.iryoRasterObj[this.mapName].setMinResolution(152.874057)
          }
        }
      }
    },
  },
  methods: {
    syozyun () {
      this.s_divs[this.mapName].sort(function(a, b) {
        if (a.m > b.m) {
          return 1;
        } else {
          return -1;
        }
      })
    },
    kojyun () {
      this.s_divs[this.mapName].sort(function(a, b) {
        if (a.m < b.m) {
          return 1;
        } else {
          return -1;
        }
      })
    },
    colorChange () {
      // --------------------------------------------------------------------
      const maxM = d3.max(this.s_divs[this.mapName], function(d){ return d.m; })
      const mArr = this.s_divs[this.mapName].map((v) => {
        return v.m
      })
      const rgbArr = this.s_divs[this.mapName].map((v) => {
        return v.rgb
      })
      console.log(maxM)
      const hyokozuColor = d3.scaleLinear().domain(mArr).range(rgbArr)
      this.$store.state.info.hyokozuColors = []
      for (let i = 0; i < maxM; i++) {
        this.$store.state.info.hyokozuColors[i] = d3.rgb(hyokozuColor(i))
      }
      Layer.hyokozu1Obj[this.mapName].getSource().changed()
      // alert(this.mapName)
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
      this.$store.state.base.editFeatureColor = colorP
    },
    reply () {
      const result = window.confirm('初期値に戻しますか。')
      if (!result) return
      this.$store.state.info.divs[this.mapName] = JSON.parse(JSON.stringify(this.divsDefault[this.mapName]))
      this.colorChange()
    },
    // inputM () {
    //
    // },
    changeM () {
      // --------------------------------------------------------------------
      this.colorChange()
      //------------------------------------------------------------------
    },
    deleteDiv (id) {
      if (this.s_divs[this.mapName].length > 2) {
        this.s_divs[this.mapName] = this.s_divs[this.mapName].filter((div) => {
          return div.id !== id
        })
        this.colorChange()
      }
    },
    appendDiv (id) {
      let maxId = d3.max(this.s_divs[this.mapName], function(d){ return d.id; })
      let order
      this.s_divs[this.mapName].find((div,i) => {
        order = i
        return div.id === id
      })
      if (order !== this.s_divs[this.mapName].length-1) {
        const tyukan = this.s_divs[this.mapName][order].m + (this.s_divs[this.mapName][order + 1].m - this.s_divs[this.mapName][order].m) / 2
        this.s_divs[this.mapName].splice(order + 1, 0, { id: maxId + 1, rgb: this.s_divs[this.mapName][order].rgb, m: tyukan })
      } else {
        console.log(this.s_divs)
        const saigo = this.s_divs[this.mapName][order].m + this.s_divs[this.mapName][order].m
        console.log(saigo)
        this.s_divs[this.mapName].push({id: maxId + 1, rgb: this.s_divs[this.mapName][order].rgb, m: saigo})
      }
      this.colorChange()
    },
    storeUpdate () {
      const syurui = this.s_iryoukikansyurui
      const kamoku = this.s_iryoukikankamoku
      this.$store.commit('base/updateListPart',{mapName: this.mapName, id:this.item.id, values: [syurui,kamoku]});
      permalink.moveEnd();
    },
  },
  watch: {
    divs(newValue) {
      console.log(newValue)



      // function compareFunc(a, b) {
      //   return a - b;
      // }
      // newValue.sort(compareFunc);
      // this.divs = newValue
      // permalink.moveEnd()
    },
  },
  mounted ()  {

    // --------------------------------------------------------------------
    this.colorChange()
    //------------------------------------------------------------------


    // this.divs = this.$store.state.info.divs
    // this.$nextTick(function () {
    //   LayersMvt.iryoMvtObj[this.mapName].getSource().changed()
    // })
  }
}
</script>

<style scoped>
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
  width: 70px;
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
</style>
