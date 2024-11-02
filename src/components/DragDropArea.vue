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
    <div class="drop-content">
      <i class="upload-icon">📄</i>
      <p>Drag and drop PDF or Image files here, or click to select files</p>
    </div>
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

<style scoped>
#drop-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#drop-area.highlight {
  border-color: #2196f3;
  background: #e3f2fd;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 48px;
  color: #666;
}

p {
  margin: 0;
  color: #666;
  font-size: 1.1em;
}
</style>