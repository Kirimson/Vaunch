<script setup lang="ts">
defineProps<{
  title: string
  fullWidth?: boolean
}>()
</script>

<style scoped>

.form-segment {
  padding: 0.5rem;
  margin: 0.5rem;
  flex: 1;
}

.full-width {
  grid-column: 1/-1;
}

@media (max-width: 576px) {
  .form-segment{
    grid-column: 1/-1;
  }
}

</style>

<template>
<div :class="{'form-segment': true, 'full-width': fullWidth}">
  <h2>{{ title }}</h2>
  <slot></slot>
</div>
</template>
