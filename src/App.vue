<!-- App.vue -->
<template>
  <header>
    <h1>
      PDFush
      <!-- <img src="@/assets/pdf.png" alt="PDF icon" /> -->
    </h1>
    <h2>Edit and Combine your PDFs</h2>
  </header>

  <DragDropArea />
  <BaseButton 
    id="combineButton" 
    :disabled="!hasPdfs || isLoading"
    @click="handleCombine"
  >
    {{ isLoading ? 'Combining...' : 'Combine PDFs' }}
  </BaseButton>

  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-spinner"></div>
    <div>Combining PDFs...</div>
  </div>

  <div id="preview-container">
    <div class="pdf-previews">
      <PdfPreview
        v-for="pdfName in Object.keys(pdfDataStore)"
        :key="pdfName"
        :pdf-name="pdfName"
      />
    </div>
  </div>

  <FullPageModal 
    v-if="showFullPageModal"
  />
  <footer>
    Multiple PDF Page-by-Page Preview with Drag and Drop
  </footer>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import DragDropArea from './components/DragDropArea.vue'
import PdfPreview from './components/PdfPreview.vue'
import FullPageModal from './components/FullPageModal.vue'
import BaseButton from './components/BaseButton.vue'

export default {
  name: 'App',
  components: {
    DragDropArea,
    PdfPreview,
    FullPageModal,
    BaseButton
  },
  computed: {
    ...mapState('pdf', ['pdfDataStore']),
    ...mapState('ui', ['modalVisible', 'showFullPageModal', 'isLoading']),
    hasPdfs() {
      return Object.keys(this.pdfDataStore).length > 0
    }
  },
  methods: {
    ...mapActions('pdf', ['combinePdfs']),
   
    async handleCombine() {
      try {
        this.combinePdfs()
      } catch (error) {
        // You might want to show an error message to the user
        console.error('Failed to combine PDFs:', error)
      }
    }
  }
}
</script>

<style>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.preview-container {
  margin: 20px 0;
}

.header-img-animate {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

#combineButton {
  margin: 20px auto;
  display: block;
  min-width: 150px;
}

#combineButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>