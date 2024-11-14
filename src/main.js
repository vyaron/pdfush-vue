import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import './utils/pdfjs-init'

import store from './store'

// Create app and use store
const app = createApp(App)
app.use(store)
app.mount('#app')
