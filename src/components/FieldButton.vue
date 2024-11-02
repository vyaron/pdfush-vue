<!-- components/FieldButton.vue -->
<template>
  <button 
    class="field-button"
    :class="{ disabled: isDisabled }"
    :disabled="isDisabled"
    @click="handleClick"
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
      isDisabled: false
    }
  },

  methods: {
    handleClick() {
      this.$emit('click', this.type)
      
      // Temporarily disable button to prevent double-clicks
      this.isDisabled = true
      setTimeout(() => {
        this.isDisabled = false
      }, 500)
    }
  }
}
</script>

<style scoped>
.field-button {
  margin: 0 5px;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.field-button:hover:not(.disabled) {
  background-color: #45a049;
}

.field-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>