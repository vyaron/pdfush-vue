<!-- components/FieldButton.vue -->
<template>
  <button 
    class="field-button"
    :class="{ disabled: isDisabled }"
    :disabled="isDisabled"
    @click.stop.prevent="handleClick"
  >
    {{ label }}
  </button>
</template>

<script>
export default {
  name: 'FieldButton',
  
  props: {
    type: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      isDisabled: false,
      isClicked: false
    }
  },

  methods: {
    handleClick() {
      if (this.isDisabled || this.isClicked) return
      
      this.isClicked = true
      this.isDisabled = true
      
      this.$emit('field-click', this.type)
      
      setTimeout(() => {
        this.isDisabled = false
        this.isClicked = false
      }, 500)
    }
  }
}
</script>

<style scoped>
.field-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 5px;
  padding: 8px 12px;
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.field-button:hover:not(.disabled) {
  background-color: #f8f9fa;
  border-color: #c8c9ca;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.field-button:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.field-button i {
  font-size: 14px;
  color: #666;
}

.field-button .label {
  font-weight: 500;
}

.field-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f8f9fa;
}

/* Add specific colors for different field types */
.field-button[data-type="signature"] {
  color: #2196f3;
  border-color: #2196f3;
}

.field-button[data-type="date"] {
  color: #4caf50;
  border-color: #4caf50;
}

.field-button[data-type="name"] {
  color: #ff9800;
  border-color: #ff9800;
}

.field-button[data-type="text"] {
  color: #9c27b0;
  border-color: #9c27b0;
}
</style>