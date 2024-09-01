<template>
    <v-dialog :dialog="s_dialogs[mapName]" :reset="1" :mapName="mapName">
        <div class="content-div" :style="{height: divHeight0 + 'px'}">
            <div class="first-content-div" :style="{height: divHeight1 + 'px'}">
                <v-layer :mapName="mapName"/>
            </div>
            <div class="drag" @mousedown="dragStart($event);aaa(mapName)" @mousemove="dragging($event)" style=""></div>
            <div class="second-content-div" :style="{height: divHeight2 + 'px'}">
                <v-layerList :mapName="mapName" />
            </div>
        </div>
    </v-dialog>
</template>

<script>
  import LayerList from './LayerList'
  import Layer from './Layer'
  export default {
    name: "Dialog-layer",
    components: {
      'v-layerList': LayerList,
      'v-layer': Layer
    },
    props: ['mapName'],
    data() {
      return {
        divHeight0:0,
        divHeight1:0,
        divHeight2:0,
        clientHeight: 0,
        isDragging: false,
        draggingMapName: '',
      }
    },
    computed: {
      s_dialogs() { return this.$store.state.base.dialogs },
      s_splitFlg() { return this.$store.state.base.splitFlg }
    },
    methods: {
      aaa (mapName) {
        this.draggingMapName = mapName
      },
      dragStart(e) {
        this.isDragging = true
      },
      dragEnd() {
        this.isDragging = false
      },
      dragging(e) {
        if (this.isDragging) {
          let rect
          if (this.draggingMapName === 'map01') {
            rect = document.querySelectorAll('.first-content-div')[0].getBoundingClientRect()
          } else {
            rect = document.querySelectorAll('.first-content-div')[1].getBoundingClientRect()
          }
          if (e.pageY - rect.top - 5 >= 0 && this.divHeight0 >= (e.pageY - rect.top + 20)) {
            this.divHeight1 = e.pageY - rect.top -5
            this.divHeight2 = this.divHeight0 - this.divHeight1 - 20
          }
        }
      },
      splitMap () {
        const map01Height = document.querySelectorAll('#map01')[0].getBoundingClientRect().height
        if (window.innerHeight > 1000) {
          if (this.s_splitFlg === 1) {
            this.divHeight0 = 700
            this.divHeight1 = 200
          } else {
            if (window.innerWidth > 850) {
              this.divHeight0 = 700
              this.divHeight1 = 200
            } else {
              this.divHeight0 = map01Height - 150
              this.divHeight1 = 100
            }
          }
        } else {
          if (window.innerWidth > 850) {
            this.divHeight0 = map01Height - 135
            this.divHeight1 = 150
          } else {
            if (this.s_splitFlg === 1) {
              this.divHeight0 = map01Height - 135
              this.divHeight1 = 150
            } else {
              this.divHeight0 = map01Height - 135
              this.divHeight1 = 100
            }
          }
        }

        if (this.divHeight0 > 700) this.divHeight0 = 700
        this.divHeight2 = this.divHeight0 - this.divHeight1 - 20

      }
    },
    watch: {
      s_splitFlg : function () {
        this.splitMap ()
      }
    },
    mounted () {
      window.addEventListener('mouseup', this.dragEnd, false)
      window.addEventListener('mousemove', this.dragging, false)
      window.addEventListener('resize', this.resize, false)
      this.splitMap ()
    }
  }
</script>

<style scoped>
    /*重要！！バウンスを止めたときに同時にスクロールを無効化させないために必要*/
    .content-div{
        /*overflow: auto;*/
        -webkit-overflow-scrolling: touch;
    }
    .first-content-div{
      border: 1px solid grey;
      margin: 5px;
      overflow-y: auto;
      background-color: gray;
    }
    .second-content-div{
      border: 1px solid grey;
      margin: 5px;
      background: rgba(255,255,255,0.5);
      overflow-y: auto;
      overflow-x: hidden;
    }
    .drag {
      height: 5px;
      background: gray;
      cursor: row-resize;
    }
    .drag:hover{
      background-color: rgba(0,60,136,0.7);
    }
</style>
