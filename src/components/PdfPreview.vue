<!-- components/PdfPreview.vue -->
<template>
  <div class="pdf-preview">
    <div class="pdf-section">
      <h3 class="pdf-title">{{ pdfName }} ({{ pdfPages.length }} pages)</h3>
      <div class="pages-container">
        <PdfPage
          v-for="page in pdfPages"
          :key="`${pdfName}-${page.originalPageNum}`"
          :pdf-name="pdfName"
          :page-num="page.pageNum"
          :original-page-num="page.originalPageNum"
          ref="pdfPages"
        />
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
      renderKey: 0
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
}
</style>