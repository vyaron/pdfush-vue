<!-- components/FullPageModal.vue -->
<template>
  <BaseModal @close="closeModal">
    <div class="toolbar">
      <div class="fields-section">
        <span class="fields-title">Add Fields:</span>
        <div class="field-buttons">
          <FieldButton 
            v-for="field in fields" 
            :key="field.type"
            :type="field.type"
            :label="field.label"
            @click="addField(field.type)"
          />
        </div>
      </div>

      <div class="nav-buttons">
        <button 
          class="nav-button"
          :disabled="!canGoBack" 
          @click="previousPage"
        >
          ← Previous
        </button>
        
        <span class="page-info">
          Page {{ activePageNum }} of {{ totalPages }}
        </span>
        
        <button 
          class="nav-button"
          :disabled="!canGoForward" 
          @click="nextPage"
        >
          Next →
        </button>
      </div>
    </div>

    <div class="page-container">
      <div class="canvas-wrapper">
        <canvas ref="canvas"></canvas>
      </div>
    </div>
  </BaseModal>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { getDocument } from 'pdfjs-dist'
import BaseModal from './BaseModal.vue'
import FieldButton from './FieldButton.vue'

export default {
  name: 'FullPageModal',
  
  components: {
    BaseModal,
    FieldButton
  },

  data() {
    return {
      scale: 1.5,
      fields: [
        { type: 'date', label: 'Date' },
        { type: 'name', label: 'Name' },
        { type: 'signature', label: 'Signature' }
      ]
    }
  },

  computed: {
    ...mapState('pdf', ['pdfDataStore', 'pageOrder']),
    ...mapState('ui', ['activePdf', 'activePageNum']),
    
    availablePages() {
      return this.pageOrder
        .filter(page => page.pdfName === this.activePdf)
        .sort((a, b) => a.pageNum - b.pageNum)
    },

    currentPageIndex() {
      return this.availablePages.findIndex(page => page.pageNum === this.activePageNum)
    },

    totalPages() {
      return this.availablePages.length
    },

    remainingPages() {
      return this.totalPages
    },

    canGoBack() {
      return this.currentPageIndex > 0
    },

    canGoForward() {
      return this.currentPageIndex < this.totalPages - 1
    }
  },

  mounted() {
    console.log('Modal mounted, rendering page...')
    this.renderPage()
  },

  watch: {
    activePageNum: 'renderPage',
    scale: 'renderPage',
    rotation: 'renderPage'
  },

  methods: {
    ...mapActions('ui', ['closeModal']),
    ...mapMutations('ui', ['SET_ACTIVE_PAGE']),

    async renderPage() {
      console.log('Rendering page:', this.activePageNum, 'of PDF:', this.activePdf)
      try {
        const pdfData = this.pdfDataStore[this.activePdf]
        if (!pdfData) {
          console.error('No PDF data found for:', this.activePdf)
          return
        }

        // Convert File to ArrayBuffer
        const arrayBuffer = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsArrayBuffer(pdfData)
        })

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const pdfDoc = await loadingTask.promise
        
        // Get the actual page number from pageOrder
        const pageInfo = this.pageOrder.find(
          page => page.pdfName === this.activePdf && page.pageNum === this.activePageNum
        )
        
        if (!pageInfo) {
          console.error('Page info not found')
          return
        }

        const page = await pdfDoc.getPage(pageInfo.originalPageNum)
        const viewport = page.getViewport({ scale: this.scale })

        const canvas = this.$refs.canvas
        const context = canvas.getContext('2d')

        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport
        }).promise

        console.log('Page rendered successfully')
      } catch (error) {
        console.error('Error rendering page:', error)
      }
    },

    previousPage() {
      if (this.canGoBack) {
        const prevPage = this.availablePages[this.currentPageIndex - 1]
        this.SET_ACTIVE_PAGE({
          pdfName: this.activePdf,
          pageNum: prevPage.pageNum
        })
      }
    },

    nextPage() {
      if (this.canGoForward) {
        const nextPage = this.availablePages[this.currentPageIndex + 1]
        this.SET_ACTIVE_PAGE({
          pdfName: this.activePdf,
          pageNum: nextPage.pageNum
        })
      }
    },

    addField(fieldType) {
      this.$emit('add-field', {
        type: fieldType,
        page: this.activePageNum
      })
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #ddd;
  background: #f8f8f8;
}

.fields-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fields-title {
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.field-buttons {
  display: flex;
  gap: 8px;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.nav-button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  min-width: 150px;
  text-align: center;
}

.page-container {
  flex: 1;
  overflow: auto;
  background: #e5e5e5;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
}

.canvas-wrapper {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-preview {
  display: block;
}
</style>