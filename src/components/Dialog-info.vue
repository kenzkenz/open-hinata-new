<template>
    <div style="position: relative">
        <div ref="div" :class="'v-dialog-info-div v-dialog-info-div-' + item.id" v-for="item in info" :key="item.id" :style="item.style" @mousedown="dialogMouseDown(item)" @mouseup="dialogMouseDown(item)">
            <div class="drag-handle" v-my-drag-handle></div>
            <div class="close-btn-div" @click="close(item)"><i style="" class="fa-solid fa-xmark hover close-btn"></i></div>
            <!--なにもないとき。普通のラスターのとき-->
            <div v-if="!item.component">
                <div class="info-content-div">
                    <p v-html="item.title"></p><hr>
                    <p v-html="item.summary"></p>
                </div>
            </div>
            <v-flood :item="item" :mapName="mapName" v-else-if="item.component.name === 'flood10m'"/>
            <v-flood :item="item" :mapName="mapName" v-else-if="item.component.name === 'flood15'"/>
            <v-flood :item="item" :mapName="mapName" v-else-if="item.component.name === 'floodSimple'"/>
            <v-seamless :item="item" :mapName="mapName" v-else-if="item.component.name === 'seamless'"/>
            <v-kouzi :item="item" :mapName="mapName" v-else-if="item.component.name === 'kouzi'"/>
            <v-dokuji :item="item" :mapName="mapName" v-else-if="item.component.name === 'dokuji'"/>
            <v-jinko-1km :item="item" :mapName="mapName" v-else-if="item.component.name === 'jinko'"/>
            <v-jinko-100m :item="item" :mapName="mapName" v-else-if="item.component.name === 'jinko100m'"/>
            <v-jinko-250m :item="item" :mapName="mapName" v-else-if="item.component.name === 'jinko250m'"/>
            <v-jinko-500m :item="item" :mapName="mapName" v-else-if="item.component.name === 'jinko500m'"/>
            <v-ssds-pref :item="item" :mapName="mapName" v-else-if="item.component.name === 'ssdsPref'"/>
            <v-ssds-pref :item="item" :mapName="mapName" v-else-if="item.component.name === 'ssdsCity'"/>
            <v-kosoku :item="item" :mapName="mapName" v-else-if="item.component.name === 'kosoku'"/>
            <v-tetsudojikeirertsu :item="item" :mapName="mapName" v-else-if="item.component.name === 'tetsudoJikeiretsu'"/>
            <v-paint :item="item" :mapName="mapName" v-else-if="item.component.name === 'syogakkoR05' || item.component.name === 'syogakkoR03' || item.component.name === 'tyugakkoR05' || item.component.name === 'tyugakkoR03'"/>
            <v-kijyunten :item="item" :mapName="mapName" v-else-if="item.component.name === 'kijyunten'"/>
            <v-tansyashin :item="item" :mapName="mapName" v-else-if="item.component.name === 'tansyashin'"/>
            <v-kinsei :item="item" :mapName="mapName" v-else-if="item.component.name === 'kinsei'"/>
            <v-meijigun :item="item" :mapName="mapName" v-else-if="item.component.name === 'meijigun'"/>
            <v-t09city :item="item" :mapName="mapName" v-else-if="item.component.name === 't09city'"/>
            <v-s25city :item="item" :mapName="mapName" v-else-if="item.component.name === 's25city'"/>
            <v-h07city :item="item" :mapName="mapName" v-else-if="item.component.name === 'h07city'"/>
            <v-r03city :item="item" :mapName="mapName" v-else-if="item.component.name === 'r03city'"/>
            <v-r05city :item="item" :mapName="mapName" v-else-if="item.component.name === 'r05city'"/>
            <v-iryou :item="item" :mapName="mapName" v-else-if="item.component.name === 'iryou'"/>
            <v-hyokozu :item="item" :mapName="mapName" v-else-if="item.component.name === 'hyokozu'"/>
            <v-op :item="item" :mapName="mapName" v-else-if="item.component.name === 'op'"/>
            <v-amagumo :item="item" :mapName="mapName" v-else-if="item.component.name === 'amagumo'"/>
            <v-himawari :item="item" :mapName="mapName" v-else-if="item.component.name === 'himawari'"/>
            <v-dosyakikikuru :item="item" :mapName="mapName" v-else-if="item.component.name === 'dosyakikikuru'"/>
            <v-kozuikikikuru :item="item" :mapName="mapName" v-else-if="item.component.name === 'kozuikikikuru'"/>
            <v-shinsuikikikuru :item="item" :mapName="mapName" v-else-if="item.component.name === 'shinsuikikikuru'"/>
        </div>
    </div>
</template>

<script>
  import DialogInfoFlood from '@/components/dialog-info/Dialog-info-flood'
  import DialogInfoSeamless from "@/components/dialog-info/Dialog-info-seamless"
  import DialogInfoKouzi from "@/components/dialog-info/Dialog-info-kouzi"
  import DialogInfoDokuji from "@/components/dialog-info/Dialog-info-dokuji"
  import DialogInfoJinko1km from '@/components/dialog-info/Dialog-info-jinko1km'
  import DialogInfoJinko100m from '@/components/dialog-info/Dialog-info-jinko100m'
  import DialogInfoJinko250m from '@/components/dialog-info/Dialog-info-jinko250m'
  import DialogInfoJinko500m from '@/components/dialog-info/Dialog-info-jinko500m'
  import DialogInfoPaint from '@/components/dialog-info/Dialog-info-paint'
  import DialogInfoSsdsPref from '@/components/dialog-info/Dialog-info-ssds'
  import DialogInfoKosoku from '@/components/dialog-info/Dialog-info-kosoku'
  import DialogInfoteTetudojikeiretsu from '@/components/dialog-info/Dialog-info-tetsudojikeirertsu'
  import DialogInfoKijyunten from '@/components/dialog-info/Dialog-info-kijyunten'
  import DialogInfoTansyashin from '@/components/dialog-info/Dialog-info-tansyashin'
  import DialogInfoKinsei from '@/components/dialog-info/Dialog-info-kinsei'
  import DialogInfoMeijigun from '@/components/dialog-info/Dialog-info-meijigun'
  import DialogInfoT09city from '@/components/dialog-info/Dialog-info-t09city'
  import DialogInfoS25city from '@/components/dialog-info/Dialog-info-s25city'
  import DialogInfoH07city from '@/components/dialog-info/Dialog-info-h07city'
  import DialogInfoR03city from '@/components/dialog-info/Dialog-info-r03city'
  import DialogInfoR05city from '@/components/dialog-info/Dialog-info-r05city'
  import DialogInfoIryou from '@/components/dialog-info/Dialog-info-iryou'
  import DialogInfoHyokozu from '@/components/dialog-info/Dialog-info-hyokozu'
  import DialogInfoOp from '@/components/dialog-info/Dialog-info-op'
  import DialogInfoAmagumo from '@/components/dialog-info/Dialog-info-amagumo'
  import DialogInfoHimawari from '@/components/dialog-info/Dialog-info-himawari'
  import DialogInfoDosyakikikuru from '@/components/dialog-info/Dialog-info-dosyakikikuru'
  import DialogInfoKozuikikikuru from '@/components/dialog-info/Dialog-info-kozuikikikuru'
  import DialogInfoShinsuikikikuru from '@/components/dialog-info/Dialog-info-shinsuikikikuru'

  import store from "@/js/store";

  export default {
    name: "v-dialog-info",
    components: {
      'v-kouzi': DialogInfoKouzi,
      'v-seamless':DialogInfoSeamless,
      'v-flood': DialogInfoFlood,
      'v-dokuji':DialogInfoDokuji,
      'v-jinko-1km':DialogInfoJinko1km,
      'v-jinko-100m':DialogInfoJinko100m,
      'v-jinko-250m':DialogInfoJinko250m,
      'v-jinko-500m':DialogInfoJinko500m,
      'v-paint':DialogInfoPaint,
      'v-ssds-pref':DialogInfoSsdsPref,
      'v-kosoku':DialogInfoKosoku,
      'v-tetsudojikeirertsu':DialogInfoteTetudojikeiretsu,
      'v-kijyunten':DialogInfoKijyunten,
      'v-tansyashin':DialogInfoTansyashin,
      'v-kinsei':DialogInfoKinsei,
      'v-meijigun':DialogInfoMeijigun,
      'v-t09city':DialogInfoT09city,
      'v-s25city':DialogInfoS25city,
      'v-h07city':DialogInfoH07city,
      'v-r03city':DialogInfoR03city,
      'v-r05city':DialogInfoR05city,
      'v-iryou':DialogInfoIryou,
      'v-hyokozu':DialogInfoHyokozu,
      'v-op':DialogInfoOp,
      'v-amagumo':DialogInfoAmagumo,
      'v-himawari':DialogInfoHimawari,
      'v-dosyakikikuru':DialogInfoDosyakikikuru,
      'v-kozuikikikuru':DialogInfoKozuikikikuru,
      'v-shinsuikikikuru':DialogInfoShinsuikikikuru,
    },
    props: ['mapName'],
    computed: {
      info () {
        return this.$store.state.base.dialogsInfo[this.mapName]
      }
    },
    methods: {
      close (item) {
        const result = this.$store.state.base.dialogsInfo[this.mapName] .find(el => el.id === item.id)
        result.style.display = 'none'
        // document.querySelector('.v-dialog-info-div-' + item.id).style.display = 'none'
      },
      dialogMouseDown (item) {
        store.commit('base/incrDialogMaxZindex')
        const result = this.$store.state.base.dialogsInfo[this.mapName] .find(el => el.id === item.id)
        document.querySelector('.v-dialog-info-div-' + item.id).style["z-index"] = this.$store.state.base.dialogMaxZindex
        result.style["z-index"] = this.$store.state.base.dialogMaxZindex
        result.style.top = document.querySelector('.v-dialog-info-div-' + item.id).style.top
        result.style.left = document.querySelector('.v-dialog-info-div-' + item.id).style.left
        result.style.display = 'block'
      }
    }
  }
</script>

<style>
    .form-group {
        margin-bottom: 0;
    }
    .v-dialog-info-div{
        position: absolute;
        z-index: 10;
        background-color: #fff;
        box-shadow:2px 2px 5px #787878;
        border: 1px solid whitesmoke;
        border-radius: 4px;
        transition: opacity 1s;
    }
    .drag-handle{
        height: 30px;
        padding: 5px;
        background-color: rgba(0,60,136,0.5);
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        cursor: grab;
        color: white;
    }
    .close-btn-div{
        position: absolute;
        top: 0;
        right: 5px;
        cursor: pointer;
        color: #fff;
        z-index: 2;
        width:30px;
        text-align: center;
    }
    .close-btn-div{
      font-size:1.5em;
    }
    .hover:hover{
      color: blue;
    }
    .info-content-div{
        padding: 10px;
        /*max-width: 350px;*/
        word-wrap: break-word;
        overflow-wrap: break-word;
    }
</style>
