<script setup lang="ts">
defineProps<{
  submit: () => any
}>()
</script>

<style scoped>
.vaunch-form {
  display: flex;
  flex-direction: row;
}
</style>

<template>
<form class="vaunch-form" @submit.prevent="submit">
  <slot></slot>
</form>
</template>