<script setup lang="ts">
defineProps<{
  submit: () => any
}>()
</script>

<style scoped>
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
<form @submit.prevent="submit">
  <slot></slot>
</form>
</template>