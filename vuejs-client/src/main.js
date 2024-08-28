import { createApp } from 'vue'

import App from './App.vue'
import { createI18n } from 'vue-i18n'
import router from './router'
import store from './store'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Import config
import config from './config'

// Import translation files
import en from './locales/en.json'
import fr from './locales/fr.json'

// Setup i18n instance with options
const i18n = createI18n({
  locale: config.language || 'en',
  fallbackLocale: config.language || 'en',
  messages: {
    en,
    fr
  }
})

const app = createApp(App)
app.use(i18n)
app.use(router)
app.use(store)

// Initialize Vuex store
store.dispatch('initializeStore');

app.mount('#app')
