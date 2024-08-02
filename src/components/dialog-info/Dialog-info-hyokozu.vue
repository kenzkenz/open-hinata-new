<template>
  <div class="content-div">
<!--    <p v-html="item.title"></p>-->
    <b-button class='olbtn' size="sm" @click="reply"><i class="fa-sharp fa-solid fa-reply-all hover"></i></b-button>

    <hr>
    <div v-for="div in s_divs[mapName]" v-bind:key="div.id" class="hyoko-div">
<!--      {{ div.m }}-->
<!--      <b-form-input type='text' :value="div.m" @input="div.m = Number($event.target.value)"></b-form-input>-->

      <!--      <input class= "input-m" :value="div.m" @input="div.m = Number($event.target.value)" @change="changeM" type="number">-->

      <input class= "input-m" :value="div.m" @input="div.m = Number($event.target.value)" @change="changeM" type="number">


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
import * as permalink from '@/js/permalink'
import * as d3 from "d3"
import * as MyMap from "@/js/mymap";
import {Chrome} from 'vue-color'

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
              { id: 0, rgb: 'rgb(0,0,255)', m: 5 },
              { id: 1, rgb: 'red', m: 10 },
              { id: 2, rgb: 'black', m: 15 },
              { id: 3, rgb: 'orange', m: 20 },
            ],
        map02:
            [
              { id: 0, rgb: 'blue', m: 5 },
              { id: 1, rgb: 'red', m: 10 },
              { id: 2, rgb: 'black', m: 15 },
              { id: 3, rgb: 'orange', m: 20 },
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
    inputM: {
      get() {

      },
      set(value) {

      }
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
    openDialog (div) {

      const dialog = this.s_dialogs['dialogColor']
      console.log(this.s_dialogs['dialogColor'])
      // if (dialog.style.display === 'block') {
      //   dialog.style.display = 'none'
      // } else {
        this.$store.commit('base/incrDialogMaxZindex');
        dialog.style["z-index"] = this.s_dialogMaxZindex;
        dialog.style.display = 'block'
        // MyMap.overlay['0'].setPosition(undefined)
        // const geoType = this.$store.state.base.editFeature.getGeometry().getType()
        // let color
        // if (geoType === 'Point' || geoType === 'LineString') {
        //   color = this.$store.state.base.editFeature.values_._color
        //   if (!color) color = 'rgba(0,0,0,1)'
        // } else if (geoType === 'Polygon' || geoType === 'Circle') {
        //   color = this.$store.state.base.editFeature.values_._fillColor
        //   if (!color) color = 'rgba(0,0,0,0.5)'
        // }
        this.$store.state.base.editDiv = div
        this.$store.state.base.editMap = this.mapName
        let color = div.rgb
        const rgba = d3.rgb(color)
        const colorP = { r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.opacity }
        this.$store.state.base.editFeatureColor = colorP
      // }
    },
    reply () {
      this.$store.state.info.divs[this.mapName] = [...this.divsDefault[this.mapName]]
    },
    // inputM () {
    //
    // },
    changeM () {
      this.divs.sort(function(a, b) {
        if (a.m > b.m) {
          return 1;
        } else {
          return -1;
        }
      })
    },
    deleteDiv (id) {
      if (this.s_divs[this.mapName].length > 2) {
        this.s_divs[this.mapName] = this.s_divs[this.mapName].filter((div) => {
          return div.id !== id
        })
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
    this.divs = this.$store.state.info.divs
    // this.$nextTick(function () {
    //   LayersMvt.iryoMvtObj[this.mapName].getSource().changed()
    // })
  }
}
</script>

<style scoped>
.hyoko-div {
  height: 100%;/*border: 1px solid #333333;*/
  position: relative;
}
.input-m {
  width: 100px;
  text-align: right;
}
.div-color {
  position: absolute;
  left: 105px;
  TOP:0;

  height: 28px;
  width:40px;
  /*background-color:red;*/
}
.tsuika-btn {
  position: absolute;
  right: 0;
  bottom:0;
}
.delete-btn {
  position: absolute;
  right: 32px;
  bottom:0;
}
.content-div{
  width: 250px;
  /*height: 390px;*/
  padding: 10px;
}
</style>
