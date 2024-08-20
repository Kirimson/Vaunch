<script setup lang="ts">
defineProps<{
  direction?: string
}>()

const emit = defineEmits<{
  submit: []
}>()
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  flex-grow: 1;
  padding: 0 1rem;
  overflow: auto;
}

form {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

form[direction="column"] {
  flex-direction: column;
}

@media (max-width: 768px) {
  form {
    flex-direction: column;
  }
}
</style>

<template>
<div class="form-container">
  <form @submit.prevent="$emit('submit')" :direction="direction">
    <slot></slot>
  </form>
</div>
</template>