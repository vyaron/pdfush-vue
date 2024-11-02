<!-- components/PdfPreview.vue -->
<template>
  <div class="pdf-preview">
    <details class="pdf-section" open>
      <summary class="pdf-summary">
        <div class="pdf-title-container">
          <h3 
            v-if="!isEditing" 
            class="pdf-title" 
            @click.prevent="startEditing"
          >
            {{ displayName }} ({{ pdfPages.length }} pages)
          </h3>
          <input
            v-else
            ref="titleInput"
            v-model="editedName"
            class="pdf-title-input"
            @blur="saveNewName"
            @keyup.enter="saveNewName"
            @keyup.esc="cancelEditing"
          />
        </div>
      </summary>
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
    </details>
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
      isDraggingActive: false,
      isEditing: false,
      editedName: '',
      scrollInterval: null
    }
  },

  computed: {
    ...mapState('pdf', ['pageOrder']),
    
    pdfPages() {
      return this.pageOrder
        .filter(page => page.pdfName === this.pdfName)
        .sort((a, b) => a.pageNum - b.pageNum)
    },

    displayName() {
      return this.pdfName.replace('.pdf', '')
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
    },

    startEditing() {
      this.editedName = this.pdfName.replace('.pdf', '')
      this.isEditing = true
      this.$nextTick(() => {
        this.$refs.titleInput?.focus()
      })
    },

    saveNewName() {
      if (!this.editedName.trim()) {
        this.cancelEditing()
        return
      }

      const newName = this.editedName.trim() + '.pdf'
      if (newName !== this.pdfName) {
        this.$store.commit('pdf/UPDATE_DOC_NAME', {
          oldName: this.pdfName,
          newName
        })
      }
      this.isEditing = false
    },

    cancelEditing() {
      this.isEditing = false
      this.editedName = ''
    },

    startAutoScroll(e) {
      if (this.scrollInterval) return;
      
      const threshold = 150; // pixels from viewport edge
      const scrollSpeed = 10;
      
      this.scrollInterval = setInterval(() => {
        const viewportHeight = window.innerHeight;
        const mouseY = e.clientY;
        
        if (mouseY < threshold) {
          // Scroll up
          window.scrollBy(0, -scrollSpeed);
        } else if (mouseY > viewportHeight - threshold) {
          // Scroll down
          window.scrollBy(0, scrollSpeed);
        }
      }, 16); // ~60fps
    },

    stopAutoScroll() {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
      }
    },
  },

  mounted() {
    document.addEventListener('dragstart', () => {
      this.isDraggingActive = true;
    });
    document.addEventListener('dragend', () => {
      this.isDraggingActive = false;
      this.isEndZoneTarget = false;
      this.stopAutoScroll();
    });
    document.addEventListener('dragover', this.startAutoScroll);
  },

  beforeDestroy() {
    document.removeEventListener('dragstart', () => {
      this.isDraggingActive = true;
    });
    document.removeEventListener('dragend', () => {
      this.isDraggingActive = false;
      this.isEndZoneTarget = false;
      this.stopAutoScroll();
    });
    document.removeEventListener('dragover', this.startAutoScroll);
    this.stopAutoScroll();
  }
}
</script>

<style scoped>
.pdf-preview {
  margin-bottom: 24px;
}

.pdf-title-container {
  margin: 0;
}

.pdf-title {
  margin: 0;
  color: #333;
  font-size: 1.1em;
  cursor: pointer;
}

.pdf-title:hover {
  color: #2196f3;
}

.pdf-title-input {
  font-size: 1.1em;
  padding: 4px 8px;
  border: 1px solid #2196f3;
  border-radius: 4px;
  width: 300px;
  margin: -4px 0;
}

.pdf-title-input:focus {
  outline: none;
  border-color: #1976d2;
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

.pdf-section {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.pdf-summary {
  padding: 12px;
  cursor: pointer;
  background: #f5f5f5;
  user-select: none;
}

.pdf-summary:hover {
  background: #eeeeee;
}

details:not([open]) .pdf-summary::before {
  transform: rotate(-90deg);
}

.pdf-title-container {
  display: inline-block;
  margin: 0;
}

.pdf-title {
  display: inline-block;
  margin: 0;
  color: #333;
  font-size: 1.1em;
  cursor: pointer;
}
</style>