import { createStore } from 'vuex'
import pdf from './modules/pdf'
import ui from './modules/ui'

export default createStore({
  modules: {
    pdf,
    ui
  }
})