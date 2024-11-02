export default {
    namespaced: true,
    state: {
      modalVisible: false,
      modalType: null,
      activePdf: null,
      activePageNum: null,
      isLoading: false,
      showFullPageModal: false
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
      },
      SHOW_MODAL(state, { pdfName, pageNum }) {
        state.showFullPageModal = true
        state.activePdf = pdfName
        state.activePageNum = pageNum
      },
      HIDE_MODAL(state) {
        state.showFullPageModal = false
        state.activePdf = null
        state.activePageNum = null
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
      },
      openModal({ commit }, pageInfo) {
        commit('SHOW_MODAL', {
          pdfName: pageInfo.pdfName,
          pageNum: pageInfo.pageNum
        })
      },
      closeModal({ commit }) {
        commit('HIDE_MODAL')
      }
    }
  }