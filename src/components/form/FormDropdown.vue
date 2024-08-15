<script setup lang="ts">
import { getCurrentInstance } from 'vue';

const props = defineProps<{
  label?: string
  name: string
  value: string
  values: string[]
}>();

const emit = defineEmits<{
  change: [value: string]
}>();

const instance = getCurrentInstance()
const initialValue = props.value
const handleChange = (event: HTMLSelectElement) => {
  emit("change", event.value)
}

const titleCase = (s: string) => {
  return s
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
</script>

<style scoped>
.input-container {
  display: flex;
}

label {
  margin-right: 0.5em;
}

input {
  width: 100%;
  flex: 1;
  border: none;
  background: none;
  font-size: 1rem;
  color: inherit;
}

input:focus {
  outline: none;
}
</style>

<template>
  <div class="container">
    <span v-if="label">{{ label }}</span>
    <div class="input-container">
      <label :for="instance?.uid + '-dropdown'">{{ name }}:</label>
      <select v-model="initialValue" @input="handleChange($event.target as HTMLSelectElement)"
        id="instance?.uid+'-dropdown'">
        <option v-for="val in values" :key="val" :value="val">{{ titleCase(val) }}</option>
      </select>
    </div>
  </div>
</template>