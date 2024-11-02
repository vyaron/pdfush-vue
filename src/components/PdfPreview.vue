<!-- components/PdfPreview.vue -->
<template>
  <div class="pdf-preview">
    <div class="pdf-section">
      <h3 class="pdf-title">{{ pdfName }} ({{ pdfPages.length }} pages)</h3>
      <div class="pages-container">
        <PdfPage
          v-for="page in pdfPages"
          :key="`${page.originalPdfName}-${page.originalPageNum}`"
          :page-info="page"
          ref="pdfPages"
        />
        <div 
          class="end-drop-zone" 
          :class="{ 'show-drop-zone': isDraggingActive }"
          @dragenter.prevent="onEndZoneDragEnter"
          @dragleave="onEndZoneDragLeave"
          @dragover.prevent
          @drop.prevent="onDropAtEnd"
        >
          <div v-if="isEndZoneTarget" class="drop-line"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import PdfPage from './PdfPage.vue'

export default {
  components: {
    PdfPage
  },

  props: {
    pdfName: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      renderKey: 0,
      isEndZoneTarget: false,
      isDraggingActive: false
    }
  },

  computed: {
    ...mapState('pdf', ['pageOrder']),
    
    pdfPages() {
      return this.pageOrder
        .filter(page => page.pdfName === this.pdfName)
        .sort((a, b) => a.pageNum - b.pageNum)
    }
  },

  watch: {
    pageOrder: {
      handler() {
        console.log('PageOrder changed, forcing re-render')
        this.renderKey++ // Force re-render of all pages
      },
      deep: true
    }
  },

  methods: {
    onEndZoneDragEnter() {
      this.isEndZoneTarget = true
    },

    onEndZoneDragLeave() {
      this.isEndZoneTarget = false
    },

    onDropAtEnd(e) {
      e.preventDefault()
      this.isEndZoneTarget = false
      
      try {
        const dragData = JSON.parse(e.dataTransfer.getData('text/plain'))
        console.log('Drop at end with data:', dragData)
        
        if (!dragData.pageNum) return
        
        this.$store.commit('pdf/REORDER_PAGES', {
          fromPage: dragData.pageNum,
          toPage: this.pdfPages.length + 1,  // After last page
          fromPdf: dragData.pdfName,
          toPdf: this.pdfName
        })
      } catch (error) {
        console.error('Drop at end error:', error)
      }
    }
  },

  mounted() {
    document.addEventListener('dragstart', () => {
      this.isDraggingActive = true
    })
    document.addEventListener('dragend', () => {
      this.isDraggingActive = false
      this.isEndZoneTarget = false
    })
  },

  beforeDestroy() {
    document.removeEventListener('dragstart', () => {
      this.isDraggingActive = true
    })
    document.removeEventListener('dragend', () => {
      this.isDraggingActive = false
      this.isEndZoneTarget = false
    })
  }
}
</script>

<style scoped>
.pdf-preview {
  margin-bottom: 24px;
}

.pdf-title {
  margin: 0 0 12px 10px;
  color: #333;
  font-size: 1.1em;
}

.pages-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  min-height: 170px;
}

.end-drop-zone {
  position: relative;
  width: 120px;
  height: 170px;
  border: 2px dashed #ccc;
  border-radius: 4px;
  display: none;
  align-items: center;
  justify-content: center;
  margin: 5px;
}

.show-drop-zone {
  display: flex;
}

.drop-line {
  position: absolute;
  left: -5px;
  top: 0;
  width: 4px;
  height: 100%;
  background-color: #2196f3;
  pointer-events: none;
}
</style>