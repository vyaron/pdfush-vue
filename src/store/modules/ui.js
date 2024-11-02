export default {
    namespaced: true,
    state: {
      modalVisible: false,
      modalType: null,
      activePdf: null,
      activePageNum: null,
      isLoading: false
    },
    mutations: {
      SET_MODAL(state, { visible, type }) {
        state.modalVisible = visible
        state.modalType = type
      },
      SET_ACTIVE_PAGE(state, { pdfName, pageNum }) {
        state.activePdf = pdfName
        state.activePageNum = pageNum
      },
      SET_LOADING(state, isLoading) {
        state.isLoading = isLoading
      }
    },
    actions: {
      showFullPage({ commit }, { pdfName, pageNum }) {
        commit('SET_ACTIVE_PAGE', { pdfName, pageNum })
        commit('SET_MODAL', { visible: true, type: 'fullPage' })
      },
      closeModal({ commit }) {
        commit('SET_MODAL', { visible: false, type: null })
        commit('SET_ACTIVE_PAGE', { pdfName: null, pageNum: null })
      }
    }
  }