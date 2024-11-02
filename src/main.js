import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'
import './style.css'
import './utils/pdfjs-init'

// Import store modules
import pdf from './store/modules/pdf'
import ui from './store/modules/ui'

// Create store
const store = createStore({
  modules: {
    pdf,
    ui
  }
})

// Create app and use store
const app = createApp(App)
app.use(store)
app.mount('#app')
