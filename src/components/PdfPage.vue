<!-- components/PdfPage.vue -->
<template>
  <div 
    class="page-container"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent
    @dragleave="onDragLeave"
    @drop="onDrop"
    :class="{ 'dragging': isDragging }"
  >
    <div class="canvas-wrapper">
      <canvas ref="canvas" class="page-preview"></canvas>
    </div>
    <div v-if="isDropTarget && !isDragging" class="drop-line"></div>
  </div>
</template>

<script>
export default {
  props: {
    pdfName: {
      type: String,
      required: true
    },
    pageNum: {
      type: Number,
      required: true
    },
    originalPageNum: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      isDragging: false,
      isDropTarget: false,
      scale: 0.3,
      isRendered: false
    }
  },

  computed: {
    pdfDataStore() {
      return this.$store.state.pdf.pdfDataStore
    }
  },

  methods: {
    async renderPage() {
      if (this.isRendered) return

      try {
        const pdfData = this.pdfDataStore[this.pdfName]
        if (!pdfData) return

        const arrayBuffer = await pdfData.arrayBuffer()
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
        const page = await pdf.getPage(this.originalPageNum)
        
        const viewport = page.getViewport({ scale: this.scale })
        const canvas = this.$refs.canvas
        const context = canvas.getContext('2d')

        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport
        }).promise

        this.isRendered = true

      } catch (error) {
        console.error('Error rendering page:', error)
      }
    },

    onDragStart(e) {
      this.isDragging = true
      document.body.classList.add('dragging-active')
      e.dataTransfer.setData('text/plain', this.pageNum.toString())
    },

    onDragEnd() {
      this.isDragging = false
      document.body.classList.remove('dragging-active')
    },

    onDragEnter() {
      if (!this.isDragging) {
        this.isDropTarget = true
      }
    },

    onDragLeave() {
      this.isDropTarget = false
    },

    onDrop(e) {
      e.preventDefault()
      this.isDropTarget = false
      
      const fromPage = parseInt(e.dataTransfer.getData('text/plain'))
      if (fromPage === this.pageNum) return
      
      this.$store.commit('pdf/REORDER_PAGES', {
        fromPage,
        toPage: this.pageNum
      })
    }
  },

  mounted() {
    this.renderPage()
  }
}
</script>

<style scoped>
.page-container {
  position: relative;
  margin: 5px;
  display: inline-block;
  cursor: grab;
}

.canvas-wrapper {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.page-preview {
  display: block;
  max-width: 100%;
  height: auto;
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

.dragging {
  opacity: 0.5;
  cursor: grabbing;
}
</style>