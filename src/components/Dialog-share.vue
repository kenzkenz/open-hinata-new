<template>
  <v-dialog :dialog="s_dialogShare" id="dialog-share">
    <div :style="contentSize">
      下記URLをコピーしてください。
      <b-button style="margin-top: 5px;margin-left: 5px;" class='olbtn' size="sm" @click="copy">コピー</b-button>
      <div class="share-div">
        {{s_shareUrl}}
      </div>
    </div>
  </v-dialog>
</template>

<script>

export default {
  name: "dialog-share",
  props: ['mapName'],
  data () {
    return {
      contentSize: {'height': '100%', 'width': '100%', 'margin': '5px', 'overflow': 'hidden', 'user-select': 'text'},
    }
  },
  components: {
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

