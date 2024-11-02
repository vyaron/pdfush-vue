import { createStore } from 'vuex'
import pdf from './modules/pdf'
import ui from './modules/ui'
import fields from './modules/fields'

export default createStore({
  modules: {
    pdf,
    ui,
    fields
  }
})