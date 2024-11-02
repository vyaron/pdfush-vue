<!-- components/common/BaseButton.vue -->
<template>
  <button 
    class="base-button"
    :class="{ disabled }"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.base-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.base-button:hover:not(.disabled) {
  background-color: #45a049;
}

.base-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>