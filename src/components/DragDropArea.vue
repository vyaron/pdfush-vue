<!-- components/DragDropArea.vue -->
<template>
  <div 
    id="drop-area" 
    :class="{ highlight: isHighlighted }"
    @dragenter.prevent="highlight"
    @dragover.prevent="highlight"
    @dragleave.prevent="unhighlight"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <p>Drag and drop PDF or Image files here, or click to select files</p>
    <input 
      ref="fileInput"
      type="file" 
      accept="application/pdf,image/*" 
      multiple 
      style="display:none"
      @change="handleFiles"
    >
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'DragDropArea',
  data() {
    return {
      isHighlighted: false
    }
  },
  methods: {
    ...mapActions('pdf', ['addPdf']),
    highlight() {
      this.isHighlighted = true
    },
    unhighlight() {
      this.isHighlighted = false
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleDrop(e) {
      this.unhighlight()
      const files = e.dataTransfer.files
      this.processFiles(files)
    },
    handleFiles(e) {
      const files = e.target.files
      this.processFiles(files)
    },
    async processFiles(files) {
      for (const file of files) {
        if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
          await this.addPdf(file)
        }
      }
    }
  }
}
</script>