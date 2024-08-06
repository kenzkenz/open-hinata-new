<template>
  <div style="padding: 10px;">
    名称変更<br>
    <input type='text' @input="henko" v-model="s_name" style="width: 300px;"><br>
    <span v-html="s_url">あ</span>
<!--    タイルURL<br>-->
<!--    <input type='text' @input="onInput" v-model="s_url" style="width: 300px;"><br>-->
<!--    <b-button style="margin-top: 5px;" class="olbtn" size="sm" @click="henko">変更</b-button>-->

 </div>
</template>
<script>
import * as permalink from '@/js/permalink'
import store from "@/js/store";
export default {
  name: "Dialog-info-dokuji",
  props: ['mapName', 'item'],
  data () {
    return {
      picked: '',
      btnSize: 'sm',
      groupName:[],
      formationAge:[]
    }
  },
  computed: {
    s_name: {
      get () {return store.state.info.layerTitle},
      set (value) {
        store.state.info.layerTitle = value
      }
    },
    s_url:{
      get() {
        return this.$store.state.info.layerUrl
      },
      set(value) {
        store.state.info.layerUrl = value
      }
    },
    s_layerList: {
      get () {return store.getters['base/layerList'](this.mapName)},
      set (value) { store.commit('base/updateList', {value: value, mapName: this.mapName}) }
    },
  },
  methods: {
    henko: function() {
      const aaa = store.state.base.layerLists['map01'].find((layer) => {
        return layer.id === store.state.info.layerId
      })
      console.log(aaa.layer.values_.source.urls[0])
      // aaa.layer.values_.source.urls[0] = this.s_url
      aaa.title = this.s_name

      const bbb = store.state.info.dokujiLayers.find((value) => {
        return value.id === store.state.info.layerId
      })
      console.log(bbb)
      bbb.name = this.s_name
      // bbb.url = this.s_url
      permalink.moveEnd()
    },
  },
  mounted ()  {
  },
  watch: {
  }
}
</script>

<style scoped>
.olbtn{
  background-color: rgba(0,60,136,0.5);
}
li {
  list-style-type: none;
}
#group-name-div{
  margin: 5px;
  border: 1px solid grey;
  padding: 5px;
}

</style>