選択されたリストを表示するvueファイル。
<template>
  <v-draggable element="ul" :options="{handle:'.handle-div, .item-div',animation: 200}" v-model="s_layerList">
<!--  <v-draggable element="ul" :options="{handle:'.handle-div',animation: 200}" v-model="s_layerList">-->
        <li v-for="item in s_layerList" :key="item.id">
            <div class="list-div">

              <div class="handle-div" ><i class="fa-solid fa-up-down fa-lg handle-icon"></i></div>

<!--              <label class="check-box" :for='mapName + "checkbox" + item.id'>-->
<!--                <div class="check-div" >-->
<!--                    <input :id='mapName + "checkbox" + item.id' type="checkbox" checked v-model="item.check" @change="checkLayer(item)">-->
<!--                    <span class="check-text"></span>-->
<!--                </div>-->
<!--              </label>-->

              <label class="eye-label">
                <input type="checkbox" class='checkbox' checked v-model="item.check" @change="checkLayer(item)">
                <span class="checkbox-eye"></span>
              </label>

              <div :id='"checkbox2-div" + item.id' class="check2-div" >
                <b-form-checkbox :id='"checkbox2" + item.id' class='check-box' v-model="item.multipli" @change="multipliLayer(item)"></b-form-checkbox>
              </div>
              <b-popover v-if="innerWidth"
                           content="合成します。"
                           :target= '"checkbox2-div" + item.id'
                           triggers="hover"
                           placement="left"
                           boundary="viewport"
              />

              <div class="item-div">
                <span class ="title-span" v-html="item.title"></span>
              </div>
              <div class="range-div"><input type="range" min="0" max="1" step="0.01" class="range" v-model.number="item.opacity" @input="opacityChange(item)" /></div>
<!--                <div class="info-div" @click="infoOpen(arguments[0],item)"><i class="fa-solid fa-circle-info hover"></i></div>-->
              <div class="info-div" @click="infoOpen(arguments[0],item)"><i class="fa-solid fa-gear hover"></i></div>

<!--              <div class="bookmark-div" @click="bookmark(item)"><span :style="bookmarkStyle"><i class="fa-sharp fa-solid fa-bookmark hover"></i></span></div>-->

<!--              <div class="bookmark-div" @click="bookmark(item)"><span :style="bookmarkStyle"><i class="fa-sharp fa-solid fa-bookmark hover"></i></span></div>-->
              <label class="bookmark-label">
                <input type="checkbox" class='bookmark-div checkbox' v-model="item.bookmark" @change="bookmark(item)">
                <span :id='"label" + item.id' class="checkbox-fontas"></span>
              </label>

              <b-popover  v-if="innerWidth"
                           content="ブックマーク"
                           :target='"label" + item.id'
                           triggers="hover"
                           placement="left"
                           boundary="viewport"
              />

              <div class="close-div" @click="removeLayer(item)"><i class="fa-sharp fa-solid fa-trash-arrow-up hover"></i></div>
            </div>
        </li>
<!--        <vue-snotify></vue-snotify>-->
    </v-draggable>
</template>

<script>
  import vuedraggable from 'vuedraggable'
  import * as permalink from '../js/permalink'
  import * as layers from '../js/layers'
  import * as MyMap from '../js/mymap'
  import store from "@/js/store";
  export default {
    name: 'Layer',
    props: ['mapName'],
    components: {
      'v-draggable': vuedraggable
    },
    data () {
      return {
        bookmarkStyle: {}
      }
    },
    methods: {
      displayNotification() {
        this.$snotify.simple({
          body: '使っていないけど残している。メソッドをどこかに仕掛ければこのメッセージがでる。今のところ不要',
          title: 'Notification Title',
          config: {}
        });
      },
      opacityChange (item) {
        MyMap.history ('透過-' + item.title)
        MyMap.opacityChange(item);
        permalink.moveEnd()
      },
      clickDiv (item) {
        MyMap.history ('不可視')
        const elm = document.querySelector('#' + this.mapName + "checkbox" + item.id)
        if (elm.checked) {
          item['check'] = false
        } else {
          item['check'] = true
        }
        MyMap.checkLayer(item, this.s_layerList, this.mapName);
        permalink.moveEnd()
      },
      checkLayer (item) {
        MyMap.history ('不可視')
        MyMap.checkLayer(item, this.s_layerList, this.mapName);
        permalink.moveEnd()
      },
      multipliLayer (item) {
        MyMap.history ('合成')
        MyMap.multipliLayer(item, this.s_layerList, this.mapName);
        permalink.moveEnd()
      },
      bookmark (item) {
        MyMap.history ('ブックマーク')
        console.log(item.bookmark)
        let bookMark = JSON.parse(localStorage.getItem('bookmark'))
        if (!bookMark) bookMark = []

        if (item.bookmark) {
          bookMark.push(item.id)
        } else {
          bookMark = bookMark.filter((v) => {
            return v !== item.id
          })
        }
        bookMark = Array.from(new Set(bookMark))
        localStorage.setItem('bookmark',JSON.stringify(bookMark))
        console.log(localStorage.getItem('bookmark'))
        console.log(this.s_layerList)
        // 重要
        store.commit('base/updateList', {value: this.s_layerList, mapName: this.mapName})


        // if (item.check===false) {
        //   item.layer.setVisible(false)
        // }else{
        //   item.layer.setVisible(true)
        // }

        // localStorage.removeItem("bookmark")

        // MyMap.removeLayer(item, this.s_layerList, this.mapName)
        // this.$store.commit('base/deleteDialogsInfo',{mapName: this.mapName})
      },
      removeLayer (item) {
        MyMap.history ('リセット3')
        MyMap.removeLayer(item, this.s_layerList, this.mapName)
        this.$store.commit('base/deleteDialogsInfo',{mapName: this.mapName})
      },
      infoOpen (e,item) {
        // const dialogEl = $(e.currentTarget).parents('.dialog-div')[0];
        console.log(e.currentTarget.parentNode)
        console.log(this.mapName)
        const dialogEl = document.querySelector('#' + this.mapName + " .dialog-div")
        const top = dialogEl.offsetTop + 'px';
        let left
        if (window.innerWidth > 1000) {
          left = (dialogEl.offsetLeft + dialogEl.offsetWidth + 5) + 'px';
        } else {
          left = '10px'
        }
        const result = this.s_dialogsINfo[this.mapName].find(el => el.id === item.id);
        this.$store.commit('base/incrDialogMaxZindex');
        if (!result) {
          const infoDialog =
            {
              id: item.id,
              title: item.title,
              summary: item.summary,
              component: item.component,
              style: {
                display: 'block',
                top: top,
                left: left,
                'z-index': this.s_dialogMaxZindex
              }
            }
          // this.$store.commit('base/deketeDialogsInfo',{mapName: this.mapName})
          this.$store.commit('base/pushDialogsInfo',{mapName: this.mapName, dialog: infoDialog})
          //-------------------------------------------------------
          this.$store.state.info.layerId = item.id
          this.$store.state.info.layerTitle = item.title
          // const result = layers.Layers.find((value) => {
          //   if (value.data) if (value.data.id) return value.data.id === item.id
          // })
          // console.log(result.data.layer.map01.values_.source.urls[0])
          // this.$store.state.info.layerUrl = result.data.layer.map01.values_.source.urls[0]
        } else {
          // 既に存在しているときは表示のみ。データを変更せずにスタイルを直接書き換えている。
          result.style.display = 'block';
          result.style["z-index"] = this.s_dialogMaxZindex
          //------------------------------------------------------
          this.$store.state.info.layerId = item.id
          this.$store.state.info.layerTitle = item.title
          // const result = layers.Layers.find((value) => {
          //   if (value.data) if (value.data.id) return value.data.id === item.id
          // })
          // this.$store.state.info.layerUrl = result.data.layer.map01.values_.source.urls[0]
        }
      }
    },
    computed: {
      innerWidth () {
        if (window.innerWidth > 500) {
          return true
        } else {
          return false
        }
      },
      // bookmarkStyle () {
      //   return {'color': 'red'}
      // },
      s_layerList: {
        get () { return this.$store.getters['base/layerList'](this.mapName) },
        set (value) { this.$store.commit('base/updateList', {value: value, mapName: this.mapName}) }
      },
      s_dialogsINfo () {
        return this.$store.state.base.dialogsInfo
      },
      s_dialogMaxZindex () {
        return this.$store.state.base.dialogMaxZindex
      },
      // watch用にlengthのあるオブジェクト
      s_layerListWatch: {
        get () {
          return {
            value: this.$store.getters['base/layerList'](this.mapName),
            length:this.$store.getters['base/layerList'](this.mapName).length }
        },
      },
      storeNotification: {
        get () { return this.$store.state.base.notification },
        set (value) { this.$store.commit('base/updateNotification', value) }
      }
    },
    mounted () {
      this.$watch(
        // 2つの値を評価させる
        () => [this.$store.getters['base/layerList'](this.mapName), this.$store.getters['base/layerList'](this.mapName).length],
        (newLayerList,oldLayerList) => {
          //newLayerList,oldLayerListは配列になっている。
          const map = this.$store.state.base.maps[this.mapName];
          if (map) MyMap.watchLayer(map, this.mapName, newLayerList,oldLayerList);
          if (this.mapName === 'map01') MyMap.history ('順番変更')
          permalink.moveEnd()
        }
      )
    }
  }
</script>

<style scoped>

    .checkbox {
      display: none;
    }

    .eye-label {
      position: absolute;
      top:3px;
      left:26px;
      width:15px;
      color:rgba(0,60,136,0.5);
      cursor: pointer;
    }
    .bookmark-label{
      position: absolute;
      top:7px;
      right:23px;
      width:15px;
      color:rgba(0,60,136,0.5);
      cursor: pointer;
    }
    .checkbox-fontas {
      position: relative;
      vertical-align: middle;
      font-size: 21px;
    }
    .checkbox + .checkbox-fontas:before {
      font-weight: 550;
      font-family: "Font Awesome 5 Free";
      content: '\f02e';
      color:rgba(0,60,136,0.5);
      cursor: pointer;
    }
    .checkbox:checked + .checkbox-fontas:before {
      /*color: #2db29c;*/
      color: white;
    }
    .checkbox-fontas:hover:before{
      color: blue;
    }

    .checkbox-eye {
      position: relative;
      vertical-align: middle;
      font-size: 20px;
    }
    .checkbox + .checkbox-eye:before {
      font-weight: 550;
      font-family: "Font Awesome 5 Free";
      content: '\f070';
      color:rgba(0,60,136,0.5);
      cursor: pointer;
    }
    .checkbox:checked + .checkbox-eye:before {
      font-weight: 550;
      font-family: "Font Awesome 5 Free";
      content: '\f06e';
      color:rgba(0,60,136,0.5);

    }
    .checkbox-eye:hover:before{
      color: blue;
    }
    .checkbox:checked + .checkbox-eye:hover:before {
      color: blue;
    }

    ul{
        padding: 0;
        margin: 0;
        position: relative;
    }
    ul li {
        color: black;
        border-bottom: solid 1px gainsboro;
        background: rgba(255,255,255,0.5);
        padding-top: 0;
        list-style-type: none!important;
        text-align: left;
        height: 39px;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    /*.check-icon{*/
    /*  margin: 10px 5px 0 5px;*/
    /*}*/
    .handle-div{
        position: absolute;
        width: 25px;
        height: 100%;
        color: #fff;
        background-color: rgba(0,60,136,0.5);
        cursor: grab;
    }
    .handle-div:hover{
      color: blue;
    }
    .handle-icon{
        margin: 10px 5px 0 8px;
    }
    .list-div{
        position: relative;
        height: 100%;
        background-color: lightsteelblue;
    }
    .item-div{
        position: absolute;
        left: 90px;
        top: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width:calc(100% - 104px);
        cursor: pointer;
    }
    .range-div{
        position: absolute;
        top:16px;
        left:86px;
        /*width:calc(100% - 104px);*/
        width:calc(100% - 127px);
    }
    .info-div{
      position: absolute;
      top:5px;
      left:70px;
      width:15px;
      cursor: pointer;
      color:rgba(0,60,136,0.5);
      font-size: large;
    }
    .check-div{
      position: absolute;
      padding-top: 0px;
      padding-left: 5px;
      left: 23px;
      top:8px;
      height: 100%;
      cursor: pointer;
    }
    .check2-div{
      position: absolute;
      margin-top: -2px;
      padding-left: 5px;
      left: 47px;
      top:8px;
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    @media screen and (max-width:500px) {
      .range-div{
        width:calc(100% - 180px);
        left:125px;
      }
      .item-div{
        left: 125px;
        width:calc(100% - 180px);
      }
      .info-div{
        top:2px;
        left:95px;
        width:15px;
        font-size: x-large;
      }
      .eye-label {
        left:32px;
      }
      .check2-div{
        top:12px;
        left: 60px;
      }
      .bookmark-label{
        right:28px;
      }
    }
    /*.bookmark-div{*/
    /*  position: absolute;*/
    /*  top:13px;*/
    /*  right:20px;*/
    /*  width:15px;*/
    /*  color:rgba(0,60,136,0.5);*/
    /*  cursor: pointer;*/
    /*}*/
    .close-div{
        font-size: large;
        position: absolute;
        top:9px;
        right:3px;
        width:15px;
        color:rgba(0,60,136,0.5);
        cursor: pointer;
    }
    .hover:hover{
        color: blue;
    }
    .hover-white:hover{
        color: white;
    }
    .el-notification__content{
        display: block;
    }
    .check3-div{
      position: absolute;
      top:13px;
      right:20px;
      width:15px;
      color:rgba(0,60,136,0.5);
      cursor: pointer;
    }
    .check-box {
      cursor: pointer;
    }
    .check-text {
      /* チェックボックスとテキストの上下を中央に */
      align-items: center;
      display: flex;
    }
    .check-box input {
      display: none; /* デフォルトのチェックボックスを非表示 */
    }
    .check-box input + .check-text::before {
      background-image: url("https://kenzkenz.xsrv.jp/open-hinata/icon/eye2.png");
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      content: "";
      height: 16px;
      position: relative;
      width: 16px;
    }
    .check-box input:checked + .check-text::before {
      background-image: url("https://kenzkenz.xsrv.jp/open-hinata/icon/eye.png");
    }
    .title-span{
      /*cursor: grab;*/
    }
</style>
<style>
    /*非scopedでないと反映しなかったため*/
    .snotifyToast__inner{
        min-height: 50px;
    }
</style>
