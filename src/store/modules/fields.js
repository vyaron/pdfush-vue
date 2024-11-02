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
      
      const newField = {
        id: `field_${Date.now()}`,
        type: field.type,
        x: Math.max(0, field.x || 0),
        y: Math.max(0, field.y || 0),
        width: field.width || (field.type === 'date' ? 100 : 200),
        height: field.type === 'signature' ? 50 : 20,
        value: null
      }
      
      console.log('Adding field with coordinates:', newField)
      
      state.fields[pdfName][pageNum].push(newField)
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
