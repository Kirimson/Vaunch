<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped>

.form-segment {
  padding: 0.5rem;
  margin: 0.5rem;
  flex: 1;
}

</style>

<template>
<div class="form-segment">
  <h2>{{ title }}</h2>
  <slot></slot>
</div>
</template>