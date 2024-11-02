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
import { PDFDocument } from 'pdf-lib'
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
        if (file.type === 'application/pdf') {
          await this.addPdf(file)
        } else if (file.type.startsWith('image/')) {
          const pdfFile = await this.convertImageToPdf(file)
          await this.addPdf(pdfFile)
        }
      }
    },
    async convertImageToPdf(file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      const imageData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
      })

      // Create a PDF from the image
      const pdfDoc = await PDFDocument.create()
      
      // Load the image based on its type
      let image
      if (file.type === 'image/jpeg') {
        image = await pdfDoc.embedJpg(imageData)
      } else if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(imageData)
      } else {
        const pngData = await this.convertImageToPng(imageData)
        image = await pdfDoc.embedPng(pngData)
      }

      // Use standard A4 page size
      const page = pdfDoc.addPage([595.28, 841.89])
      const { width, height } = image
      
      // Calculate scaling to fit the image
      const pageWidth = page.getWidth()
      const pageHeight = page.getHeight()
      
      let scaledWidth = pageWidth - 40
      let scaledHeight = (height * scaledWidth) / width
      
      if (scaledHeight > pageHeight - 40) {
        scaledHeight = pageHeight - 40
        scaledWidth = (width * scaledHeight) / height
      }
      
      // Center the image
      const x = (pageWidth - scaledWidth) / 2
      const y = (pageHeight - scaledHeight) / 2

      // Draw the image
      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight
      })

      // Create PDF file
      const pdfBytes = await pdfDoc.save()
      return new File([pdfBytes], `${file.name}.pdf`, { type: 'application/pdf' })
    },
    convertImageToPng(imageData) {
      return new Promise((resolve) => {
        const tempImage = new Image()
        tempImage.src = imageData
        tempImage.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = tempImage.width
          canvas.height = tempImage.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(tempImage, 0, 0)
          resolve(canvas.toDataURL('image/png').split(',')[1])
        }
      })
    }
  }
}
</script>

<style scoped>
#drop-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
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
  gap: 8px;
}

.upload-icon {
  font-size: 32px;
  color: #666;
}

p {
  margin: 0;
  color: #666;
  font-size: 1.1em;
}
</style>