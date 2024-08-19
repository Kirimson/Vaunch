<script setup lang="ts">
defineProps<{
  submit: () => any
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
  display: flex;
  flex-direction: row;
}

@media (max-width: 768px) {
  form {
    flex-direction: column;
  }
}
</style>

<template>
<div class="form-container">
  <form @submit.prevent="submit">
    <slot></slot>
  </form>
</div>
</template>