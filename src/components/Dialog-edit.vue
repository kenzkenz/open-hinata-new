<template>
  <v-dialog :dialog="s_dialogEdit" id="dialog-edit">
    <div :style="contentSize">
      <input style="width: 300px;" type="text" @input="changeName" v-model="s_featureName" placeholder="名称を入力">
      <hr>
<!--/*      <textarea style="width: 300px;" rows="4" cols="35" @input="changeName" v-model="s_featureSetumei" placeholder="説明を入力"></textarea>*/-->

      <quill-editor v-model="s_featureSetumei"
                    ref="quillEditor"
                    @input="changeName"
      >
      </quill-editor>

      <hr>
      <img :src="s_featureSrc" style="width: 300px;margin-bottom: 10px">
      <form id="my_form" style="display: none">
        <input id="my_form_input" type="file" name="file_1" accept="image/*" @change="file_upload()">
      </form>
      <b-button class='olbtn' size="sm" @click="upLoad">画像</b-button>
      <b-button style="margin-left: 10px" :pressed.sync="s_toggleModify" class='olbtn' size="sm">変形</b-button>
      <b-button style="margin-left: 10px" class='olbtn' size="sm" @click="openDialog">色</b-button>
<!--      <div style="position: relative;">-->
<!--        <chrome-picker v-model="colors" style="position: absolute;top:10px;"/>-->
<!--      </div>-->
      <b-button style="margin-left: 10px" class='olbtn' size="sm" @click="featureRemove">削除</b-button>
    </div>
  </v-dialog>
</template>

<script>
import * as MyMap from '../js/mymap'
import {moveEnd} from "@/js/permalink"
import store from "@/js/store";
import {Chrome} from 'vue-color'
import * as d3 from "d3"

export default {
  name: "dialog-edit",
  data () {
    return {
      colors: '',
      togglePoint: false,
      contentSize: {'height': 'auto', 'margin': '10px', 'overflow': 'hidden', 'user-select': 'text'},
    }
  },
  components: {
    'chrome-picker': Chrome
  },
  computed: {
    s_dialogMaxZindex () { return this.$store.state.base.dialogMaxZindex},
    s_dialogs () { return this.$store.state.base.dialogs},
    s_toggleModify: {
      get() {
        return this.$store.state.base.toggleModify
      },
      set(value) {
        this.$store.state.base.toggleModify = value
      }
    },
    s_dialogEdit () {
      return this.$store.state.base.dialogs.dialogEdit
    },
    s_featureName: {
      get () { return this.$store.state.base.editFeatureName },
      set (value) {
        this.$store.state.base.editFeatureName = value
      }
    },
    s_featureSetumei: {
      get () { return this.$store.state.base.editFeatureSetumei },
      set (value) {
        this.$store.state.base.editFeatureSetumei = value
      }
    },
    s_featureSrc () {
      return this.$store.state.base.editFeatureSrc
    },
  },
  methods: {
    openDialog () {
      this.$store.state.base.editDiv = ''
      const dialog = this.s_dialogs['dialogColor']['map01']
      if (dialog.style.display === 'block') {
        dialog.style.display = 'none'
      } else {
        this.$store.commit('base/incrDialogMaxZindex');
        dialog.style["z-index"] = this.s_dialogMaxZindex;
        dialog.style.display = 'block'
        MyMap.overlay['0'].setPosition(undefined)
        const geoType = this.$store.state.base.editFeature.getGeometry().getType()
        let color
        if (geoType === 'Point' || geoType === 'LineString') {
          color = this.$store.state.base.editFeature.values_._color
          if (!color) color = 'rgba(0,0,0,1)'
        } else if (geoType === 'Polygon' || geoType === 'Circle') {
          color = this.$store.state.base.editFeature.values_._fillColor
          if (!color) color = 'rgba(0,0,0,0.5)'
        }
        const rgba = d3.rgb(color)
        const colorP = { r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.opacity }
        this.$store.state.base.editFeatureColor['map01'] = colorP
      }
    },
    color(){
      alert()
    },
    upLoad(){
      document.getElementById("my_form_input").click();
    },
    featureRemove(){
      const result = window.confirm('削除しますか。');
      if( !result ) return
      MyMap.drawLayer.getSource().removeFeature(this.$store.state.base.editFeature)
      MyMap.drawLayer2.getSource().removeFeature(this.$store.state.base.editFeature)
      store.state.base.dialogs.dialogEdit.style.display = 'none'
      MyMap.overlay['0'].setPosition(undefined)
    },
    changeName(e) {
      const feature = this.$store.state.base.editFeature
      feature.setProperties({name: this.$store.state.base.editFeatureName})
      feature.setProperties({description: this.$store.state.base.editFeatureSetumei})
      document.querySelector('#drawLayer2-name').innerHTML = this.$store.state.base.editFeatureName
      console.log(this.$store.state.base.editFeatureSetumei)


      document.querySelector('#drawLayer2-setumei').innerHTML = this.$store.state.base.editFeatureSetumei
      console.log(document.querySelector('#drawLayer2-setumei').innerHTML)
      moveEnd()
    },
    file_upload() {
      const vm = this
      // d3.select('#' + mapName + ' .loadingImg').style("display","block")
      document.querySelector('#map01 .loadingImg').style.display = 'block'
      // フォームデータを取得
      const formdata = new FormData(document.getElementById("my_form"));
      // XMLHttpRequestによるアップロード処理
      const xhttpreq = new XMLHttpRequest();
      xhttpreq.addEventListener("progress", function(e){
        var progress_data = e.loaded / e.total;
        console.log('progress:'+progress_data);
      }, false);

      xhttpreq.open("POST", "https://kenzkenz.xsrv.jp/open-hinata/php/upload.php", true);
      xhttpreq.send(formdata);
      xhttpreq.addEventListener("load", function(e){
        let fileName = JSON.parse(e.target.response).fileName
        console.log(fileName)
        fileName = 'https://kenzkenz.xsrv.jp/open-hinata/php/img/' + fileName
        vm.$store.state.base.editFeatureSrc = fileName

        const feature = vm.$store.state.base.editFeature
        // console.log(feature)

        feature.setProperties({src: fileName})
        document.querySelector('#drawLayer2-src').src = fileName
        document.querySelector('#drawLayer2-href').href = fileName
        document.querySelector('#drawLayer2-href').style.display = 'block'
        document.querySelector('#map01 .loadingImg').style.display = 'none'

      }, false);
    }
  },
  mounted () {
    const dragHandle = document.querySelector('#dialog-edit .drag-handle');
    dragHandle.innerHTML = '編集'
    this.$watch(function () {
      return [this.s_toggleModify]
    }, function () {
      if (this.s_toggleModify) {
        this.$store.state.base.maps['map01'].addInteraction(MyMap.modifyInteraction)
        this.s_togglePoint = false
        MyMap.overlay['0'].setPosition(undefined)
      } else {
        this.$store.state.base.maps['map01'].removeInteraction(MyMap.modifyInteraction)
      }
    })
  }
}
</script>

<style scoped>
.quill-editor {
  /*height: 100px;*/
}
.olbtn{
  background-color: rgba(0,60,136,0.5);
}
.olbtn:hover{
  background-color: rgba(0,60,136,0.7);
}
</style>
