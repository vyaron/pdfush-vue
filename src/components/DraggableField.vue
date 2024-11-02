<template>
  <div
    class="draggable-field"
    :class="field.type"
    :style="{
      left: `${field.x}px`,
      top: `${field.y}px`,
      width: `${field.width}px`,
      height: `${field.height}px`
    }"
    @mousedown="startDrag"
  >
    <div class="field-content">
      <i :class="fieldIcon"></i>
      <span>{{ field.type }}</span>
    </div>
    <button class="remove-btn" @click.stop="removeField">×</button>
  </div>
</template>

<script>
export default {
  name: 'DraggableField',
  
  props: {
    field: {
      type: Object,
      required: true
    },
    pdfName: {
      type: String,
      required: true
    },
    pageNum: {
      type: Number,
      required: true
    }
  },

  computed: {
    fieldIcon() {
      const icons = {
        signature: 'fas fa-signature',
        date: 'fas fa-calendar',
        name: 'fas fa-user'
      }
      return icons[this.field.type] || 'fas fa-square'
    }
  },

  methods: {
    startDrag(e) {
      const initialX = e.clientX - this.field.x
      const initialY = e.clientY - this.field.y

      const onMouseMove = (e) => {
        const x = e.clientX - initialX
        const y = e.clientY - initialY
        
        this.$store.commit('fields/UPDATE_FIELD_POSITION', {
          pdfName: this.pdfName,
          pageNum: this.pageNum,
          fieldId: this.field.id,
          x,
          y
        })
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },

    removeField() {
      this.$store.commit('fields/REMOVE_FIELD', {
        pdfName: this.pdfName,
        pageNum: this.pageNum,
        fieldId: this.field.id
      })
    }
  }
}
</script>

<style scoped>
.draggable-field {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #2196f3;
  border-radius: 4px;
  padding: 8px;
  cursor: move;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.field-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
}

.remove-btn:hover {
  color: #bd2130;
}

.signature { border-color: #28a745; }
.date { border-color: #ffc107; }
.name { border-color: #17a2b8; }
</style> 