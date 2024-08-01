<template>
  <div class="content-div">
<!--    <p v-html="item.title"></p>-->
    <b-button class='olbtn' size="sm" @click="reply"><i class="fa-sharp fa-solid fa-reply-all hover"></i></b-button>

    <hr>
    <div v-for="div in divs" v-bind:key="div.id" class="hyoko-div">
<!--      {{ div.m }}-->
<!--      <b-form-input type='text' :value="div.m" @input="div.m = Number($event.target.value)"></b-form-input>-->
      <input class= "input-m" :value="div.m" @input="div.m = Number($event.target.value)" @change="changeM" type="number">
      <div class="div-color" :style="{ 'background-color': div.rgb }"> </div>
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

export default {
  name: "Dialog-info-hyokozu",
  props: ['mapName', 'item'],
  components: {
  },
  data () {
    return {
      divs: [
        // { id: 0, rgb: 0, m: 5 },
        // { id: 1, rgb: 1, m: 10 },
        // { id: 2, rgb: 2, m: 15 },
        // { id: 3, rgb: 3, m: 20 },
      ],
      divsDefault: [
        { id: 0, rgb: 'blue', m: 5 },
        { id: 1, rgb: 'red', m: 10 },
        { id: 2, rgb: 'gray', m: 15 },
        { id: 3, rgb: 'orange', m: 20 },
      ],
    }
  },
  computed: {
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
    reply () {
      this.divs = [...this.divsDefault]
    },
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
      if (this.divs.length > 2) {
        this.divs = this.divs.filter((div) => {
          return div.id !== id
        })
      }
    },
    appendDiv (id) {
      let maxId = d3.max(this.divs, function(d){ return d.id; })
      let order
      this.divs.find((div,i) => {
        order = i
        return div.id === id
      })
      if (order !== this.divs.length-1) {
        const tyukan = this.divs[order].m + (this.divs[order + 1].m - this.divs[order].m) / 2
        this.divs.splice(order + 1, 0, { id: maxId + 1, rgb: this.divs[order].rgb, m: tyukan })
      } else {
        console.log(this.divs)
        const saigo = this.divs[order].m + this.divs[order].m
        console.log(saigo)
        this.divs.push({id: maxId + 1, rgb: this.divs[order].rgb, m: saigo})
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
