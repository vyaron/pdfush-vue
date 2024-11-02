
export default {
  namespaced: true,
  
  state: {
    fields: {}, // Organized by pdfName -> pageNum -> fieldList
  },
  
  mutations: {
    ADD_FIELD(state, { pdfName, pageNum, field }) {
      if (!state.fields[pdfName]) {
        state.fields[pdfName] = {}
      }
      if (!state.fields[pdfName][pageNum]) {
        state.fields[pdfName][pageNum] = []
      }
      
      state.fields[pdfName][pageNum].push({
        id: `field_${Date.now()}`,
        type: field.type,
        x: field.x,
        y: field.y,
        width: field.width || 150,
        height: field.height || 40,
        value: null
      })
    },

    UPDATE_FIELD_POSITION(state, { pdfName, pageNum, fieldId, x, y }) {
      const field = state.fields[pdfName][pageNum].find(f => f.id === fieldId)
      if (field) {
        field.x = x
        field.y = y
      }
    },

    UPDATE_FIELD_VALUE(state, { pdfName, pageNum, fieldId, value }) {
      const field = state.fields[pdfName][pageNum].find(f => f.id === fieldId)
      if (field) {
        field.value = value
      }
    },

    REMOVE_FIELD(state, { pdfName, pageNum, fieldId }) {
      state.fields[pdfName][pageNum] = state.fields[pdfName][pageNum]
        .filter(f => f.id !== fieldId)
    }
  },

  getters: {
    getPageFields: (state) => (pdfName, pageNum) => {
      return state.fields[pdfName]?.[pageNum] || []
    }
  }
}
