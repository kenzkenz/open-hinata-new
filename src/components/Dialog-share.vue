<template>
  <v-dialog :dialog="s_dialogShare" id="dialog-share">
    <div :style="contentSize">
       下記URLをコピーしてください。
<!--      <b-button style="margin-top: 5px;margin-left: 5px;" class='olbtn' size="sm" @click="copy">コピー</b-button>-->
<!--      <div class="share-div">-->
<!--        {{s_shareUrl}}-->
<!--      </div>-->


      <b-input-group
          style="margin-top: 10px;margin-bottom: 10px"
          size="sm"
      >
        <b-form-input :value="s_shareUrl" style="font-size: small;"></b-form-input>
        <b-input-group-append>
          <b-button @click="copy" class='olbtn' size="sm" text="Button" >コピー</b-button>
        </b-input-group-append>
      </b-input-group>



      <div style="position: relative;width: 100%;">
        <vue-qrcode
            v-if="s_shareUrl"
            :value="s_shareUrl"
            :options="option"
        />
        <b-form-checkbox style="position: absolute;top:-10px;right:30px" v-model="kakudai" @change="kakudaiChange" name="check-button" switch>
          拡大
        </b-form-checkbox>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import VueQrcode from '@chenfengyuan/vue-qrcode'
export default {
  name: "dialog-share",
  props: ['mapName'],
  data () {
    return {
      kakudai: false,
      option: {
        // errorCorrectionLevel: "M",
        // maskPattern: 0,
        margin: 2,
        // scale: 4,
        width: 200,
        // color: {
        //   dark: "#000000FF",
        //   light: "#FFFFFFFF"
        // }
      },
      contentSize: {'height': '100%', 'width': '100%', 'padding': '5px', 'overflow': 'hidden', 'user-select': 'text'},
    }
  },
  components: {
    VueQrcode,
  },
  computed: {
    s_dialogShare () {
      return this.$store.state.base.dialogs.dialogShare
    },
    s_shareUrl () {
      return this.$store.state.base.shareUrl
    },
  },
  methods: {
    kakudaiChange () {
      console.log(this.kakudai)
      if (this.kakudai) {
        this.option.width = 370
        this.option.margin = 1
      } else {
        this.option.width = 200
        this.option.margin = 2
      }
    },
    copy () {
      const txt = this.$store.state.base.shareUrl
      navigator.clipboard.writeText(txt).then(
          () => {
            alert('クリップボードにコピーしました。');
          },
          () => {
            alert('コピーに失敗しました。');
          });
    },
  },
  mounted () {
  }
}
</script>

<style scoped>
.olbtn{
  background-color: rgba(0,60,136,0.5);
}
.olbtn:hover{
  background-color: rgba(0,60,136,0.7);
}
.share-div {
  margin: 10px;
  height: 50px;
  width: 90%;
  padding: 10px;
  border: 1px solid darkgray;
  font-size: small;
}
</style>

