import Vue from 'vue'
import App from './components/App'
import store from './js/store'
// import Snotify from 'vue-snotify'
// import 'vue-snotify/styles/material.css'
import Dialog from './components/Dialog'
import DialogInfo from './components/Dialog-info'
import Dialog2 from './components/Dialog2'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import drag from './js/drag'
import VModal from 'vue-js-modal'
import dragV from 'v-drag'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
const editorOption = {
    modules: {
        // table: true,
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            // ['clean'],
            // テーブルメニューを追加
            // [{ table: ['newtable_1_1'] }, { table: 'append-row' }, { table: 'append-col' }],
        ],
    },
    placeholder: '説明を入力',
};

Vue.use(VueQuillEditor, editorOption);
// Vue.use(VueQuillEditor)
Vue.component('VueSlider', VueSlider)
Vue.use(dragV, {
    // global configuration
});
Vue.use(VModal);
Vue.use(drag);
Vue.use(BootstrapVue);
Vue.component('v-dialog', Dialog);
Vue.component('v-dialog-info', DialogInfo);
Vue.component('v-dialog2', Dialog2);
// Vue.use(Snotify);
Vue.config.productionTip = false;
new Vue({
    store,
    render: h => h(App)
}).$mount('#app');
