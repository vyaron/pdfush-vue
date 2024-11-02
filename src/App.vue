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
    :disabled="!hasPdfs"
    @click="combinePdfs"
  >
    Combine PDFs
  </BaseButton>
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
    @add-field="handleAddField"
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
    ...mapState('ui', ['modalVisible', 'showFullPageModal']),
    hasPdfs() {
      return Object.keys(this.pdfDataStore).length > 0
    }
  },
  methods: {
    ...mapActions('pdf', ['combinePdfs']),
    handleAddField(fieldData) {
      // Handle field addition here
      console.log('Adding field:', fieldData)
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
</style>