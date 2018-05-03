/* eslint-disable */
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.


import Vue from 'vue'
import 'vue-use-vuex';
import 'velocity-animate'
import Vuex from 'vuex'
Vue.use(Vuex)

import VueQRCodeComponent from 'vue-qrcode-component'
import Vuetify from 'vuetify'
import GetTextPlugin from 'vue-gettext'
import translations from './translations.json'
import App from './App'

import { sync } from 'vuex-router-sync'
import router from './modules/router'
import store from './modules/store';
import IEDetect from "./utils/ie"
import './components/ListStagger';

if(IEDetect() > 0 && IEDetect() < 12){

  document.getElementById("no-ie").style.cssText = "display:block";
 
} else {

  sync(store, router)
  Vue.use(GetTextPlugin, {
    availableLanguages: {
      en: 'English',
      es: 'Español',
    },
    defaultLanguage: 'en',
    translations: translations,
    silent: process.env.NODE_ENV !== 'development',
  })

  Vue.use(Vuetify)
  Vue.config.productionTip = false
  Vue.component('qr-code', VueQRCodeComponent)


  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App }
  })
}
