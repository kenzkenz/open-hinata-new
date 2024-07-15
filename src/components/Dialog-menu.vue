<template>
    <v-dialog :dialog="S_menuDialog">
        <div :style="menuContentSize">
            <div>
<!--                <br>-->
                <b-button class='olbtn' :size="btnSize" @click="reset01">リセット</b-button>
<!--                <b-button class='olbtn' :size="btnSize" @click="reset02" style="margin-left:5px;">座標を残してリセット</b-button>-->
            </div>
            <hr>
<!--            <div>-->
<!--                <b-button class='olbtn' :size="btnSize" @click="shortUrl">短縮URL作成</b-button>-->
<!--                <div class="shortUrl-div">{{ shortUrlText }}</div>-->
<!--            </div>-->
<!--            <hr>-->
<!--            <div>-->
<!--              <b-button class='olbtn' :size="btnSize" @click="shortUrlBitly">短縮URL作成(Bitly)</b-button>-->
<!--              <div class="shortUrl-div">{{ shortUrlTextBitly }}</div>-->
<!--            </div>-->

<!--            <div>-->
<!--                <b-button :pressed.sync="toggle" class='olbtn' :size="btnSize">{{ toggle ? 'ブロックOFF' : 'ブロックON' }}</b-button>-->
<!--                <b-form-select v-model="selected" :options="options" style="width: 60px;margin-left: 10px;"/>-->
<!--            </div>-->
            <div>
              <b-button :pressed.sync="toggleCenter" class='olbtn' :size="btnSize">{{ toggleCenter ? '中心十字ON' : '中心十字OFF' }}</b-button>
            </div>
            <hr>
            <input type='text' @change="onInput" v-model="address" placeholder="住所or座標で検索します。" style="width: 300px;">
            <hr>
<!--            <a id="toPng" href="#" download="image.png" @click='toPng'>PNGダウンロード</a><br>-->

            <b-button class='olbtn' :size="btnSize" @click="printLeft">画像保存と印刷</b-button>
            <b-button v-if="s_splitFlg === 2" style="margin-left: 10px" class='olbtn' :size="btnSize" @click="printRight">画像保存と印刷（右画面）</b-button>
            <hr>
            <b-button class='olbtn' :size="btnSize" @click="openDialog">背景追加（XYZタイル）</b-button>
            <br>
            <br>
            <label for='jump-check'>背景選択時に設定地にジャンプする</label><input id='jump-check' type="checkbox" v-model="s_jumpFlg">

        </div>
    </v-dialog>
</template>

<script>
  import axios from 'axios'
  import * as MyMap from '../js/mymap'

  export default {
    name: "Menu",
    data () {
      return {
        address: '',
        menuContentSize: {'height': 'auto','margin': '10px', 'overflow': 'auto', 'user-select': 'text'},
        btnSize: 'sm',
        shortUrlText: '',
        shortUrlTextBitly: '',
        toggleCenter: true,
        selected: 20,
        options: [
          { value: '20', text: '20' },
          { value: '30', text: '30' },
          { value: '50', text: '50' }
        ],
      }
    },
    computed: {
      s_dialogDokuji () {
        return this.$store.state.base.dialogs.dialogDokuji
      },
      s_dialogMaxZindex () { return this.$store.state.base.dialogMaxZindex},
      s_jumpFlg: {
        get() {
          return this.$store.state.base.jumpFlg
        },
        set(value) {
          this.$store.state.base.jumpFlg = value
          localStorage.setItem('jump',this.s_jumpFlg)
        }
      },
      s_splitFlg () {
        return this.$store.state.base.splitFlg
      },
      S_menuDialog () {
        return this.$store.state.base.dialogs.menuDialog
      }
    },
    methods: {
      openDialog () {
        const dialog = this.s_dialogDokuji
        if (dialog.style.display === 'block') {
          dialog.style.display = 'none'
        } else {
          this.$store.commit('base/incrDialogMaxZindex');
          dialog.style["z-index"] = this.s_dialogMaxZindex;
          dialog.style.display = 'block'
        }
      },
      printLeft () {
        console.log(this.$store.state.base.splitFlg)
        MyMap.history ('印刷画面へ')
        const printBtn = document.querySelector('#map01 .ol-print button')
        printBtn.click()
      },
      printRight () {
        MyMap.history ('印刷画面へ')
        const printBtn = document.querySelector('#map02 .ol-print button')
        printBtn.click()
      },
      // ------------------------------------------------------------------------------------------
      onInput() {
        MyMap.history (this.address)
        MyMap.addressSerch('map01',this.address)
      },
      // リセット------------------------------------------------------------------------------------
      reset01() {
        MyMap.history ('リセット')
        let url = window.location.href.split("#")[0];
        // url = url + "?"
        console.log(url)
        history.pushState(null, null,url);
        window.location.reload(true);
      },
      reset02() {
        const url = decodeURIComponent(window.location.href).split("?")[0];
        history.pushState(null, null,url);
        window.location.reload(true);
      },
      // 短縮URL作成----------------------------------------------------------------------------
      shortUrl () {
        const vm = this;
        const parameters = decodeURIComponent(window.location.hash)
        axios
            .get('https://kenzkenz.xsrv.jp/open-hinata/php/shorturl.php',{
              params: {
                parameters: parameters
              }
            })
            .then(function (response) {
              console.log(response)
              let host
              if (window.location.host.indexOf('localhost') !== -1) {
                host = 'http://localhost:8080/#s'
              } else {
                host = 'https://kenzkenz.xsrv.jp/open-hinata/#s'
              }
              // vm.shortUrlText = 'https://kenzkenz.xsrv.jp/open-hinata/#' + response.data.urlid
              vm.shortUrlText = host + response.data.urlid
            })
            .catch(function (error) {
              console.log(error);
            })
            .finally(function () {
            });
      },
      shortUrlBitly () {
        MyMap.history ('短縮URL')
        const vm = this;
        // let target = 'https://kenzkenz.xsrv.jp/open-hinata/#11.213333333333333/135.39004/34.87765%3FS%3D1%26L%3D%5B%5B%7B%22id%22%3A%22nihonisan%22%2C%22ck%22%3Atrue%2C%22o%22%3A1%7D%2C%7B%22id%22%3A%22flood10m%22%2C%22ck%22%3Atrue%2C%22o%22%3A1%2C%22c%22%3A%7B%22name%22%3A%22flood10m%22%2C%22values%22%3A%5B56%2C100%5D%7D%7D%2C%7B%22id%22%3A%22sizen%22%2C%22m%22%3Atrue%2C%22ck%22%3Atrue%2C%22o%22%3A1%7D%2C%7B%22id%22%3A%22inei%22%2C%22m%22%3Atrue%2C%22ck%22%3Atrue%2C%22o%22%3A1%7D%2C%7B%22id%22%3A2%2C%22ck%22%3Atrue%2C%22o%22%3A1%2C%22c%22%3A%22%22%7D%5D%2C%5B%7B%22id%22%3A2%2C%22ck%22%3Atrue%2C%22o%22%3A1%2C%22c%22%3A%22%22%7D%5D%2C%5B%7B%22id%22%3A2%2C%22ck%22%3Atrue%2C%22o%22%3A1%2C%22c%22%3A%22%22%7D%5D%2C%5B%7B%22id%22%3A2%2C%22ck%22%3Atrue%2C%22o%22%3A1%2C%22c%22%3A%22%22%7D%5D%5D'
        let target = window.location.href;
        target = decodeURIComponent(target) /*ちょっとでも短くするため*/

        const BITLY_ACCESS_TOKEN = '032704dc9764ff62c36ef2aff9464eb50e89b4fe' || "";
        (async () => {
          try {
            const endpoint = 'https://api-ssl.bitly.com/v4';
            const url = `${endpoint}/shorten`;
            const options = {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${BITLY_ACCESS_TOKEN}`
              }
            };
            const params = {
              long_url: target
            };
            const res = await axios.post(url, params, options);
            console.log(res.data.link);
            vm.shortUrlTextBitly = res.data.link
          } catch (error) {
            console.log(error.response.body);
          }
        })();
      },
      toPng(){
        MyMap.history ('PNGダウンロード')
        const map = this.$store.state.base.maps['map01']
        const targetArr = []
        const targets = map.getControls().array_
        const targetsMap = targets.map(value => {
          return value
        });
        targetsMap.forEach(target => {
          targetArr.push(target)
          console.log(target)
          map.removeControl(target)
        })

        const type = 'image/png';
        const canvas = document.querySelector("canvas");
        const ol3d = this.$store.state.base.ol3d['map01']
        let dataurl
        if (ol3d) {
          const pngScene = ol3d.getCesiumScene()
          pngScene.render();//セシウムのsceneを使う。
          dataurl = pngScene.canvas.toDataURL(type)
        } else {
          dataurl = canvas.toDataURL(type)
        }
        const bin = atob(dataurl.split(',')[1]);
        const buffer = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++){
          buffer[i] = bin.charCodeAt(i);
        }
        const blob = new Blob([buffer.buffer],{type:type});
        document.getElementById('toPng').href = window.URL.createObjectURL(blob);
        targetArr.forEach(target => {
          map.addControl(target)
        })
      }
    },
    mounted () {
      // console.log(this.$store.state.base.splitFlg)
      //------------------------------------------------------------
      this.$watch(function () {
        return [this.toggleCenter]
      }, function () {
        MyMap.history ('中心十字onoff')
        const target = document.querySelector(".center-target");
        if (this.toggleCenter) {
          console.log('on')
          target.style.display = 'block';
        } else {
          console.log('off')
          target.style.display = 'none';
        }
        localStorage.setItem('centerTarget',this.toggleCenter)
        console.log(localStorage.getItem('centerTarget'))
      })
      //------------------------------------------------------------
      if (localStorage.getItem('centerTarget') === 'false') {
        this.toggleCenter = false
      } else {
        this.toggleCenter = true
      }
      if (localStorage.getItem('jump') === 'false') {
        this.s_jumpFlg = false
      } else {
        this.s_jumpFlg = true
      }
    }
  }
</script>

<style scoped>
    .shortUrl-div{
        margin-top: 10px;
        padding: 5px;
        border: solid 1px gray;
        height: 36px;
    }
    .olbtn{
        background-color: rgba(0,60,136,0.5);
    }
    .btn-secondary:hover{
        background-color: rgba(0,60,136,0.7);
    }
</style>
