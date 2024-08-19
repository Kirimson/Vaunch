<script setup lang="ts">
import { getCurrentInstance } from 'vue';

const props = defineProps<{
  label?: string
  name: string
  value: string
  values: string[]
  formatDisplayNames?: boolean
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
@import url("@/components/form/form.css");

select {
  font: inherit;
  color: inherit;
  border: none;
  border-radius: 5px;
  background-color: transparent;
  flex: 1;
}

</style>

<template>
  <div class="container">
    <span class="description" v-if="label">{{ label }}</span>
    <div class="input-container">
      <label :for="instance?.uid + '-dropdown'">{{ name }}:</label>
      <select v-model="initialValue" @input="handleChange($event.target as HTMLSelectElement)"
        id="instance?.uid+'-dropdown'">
        <option v-for="val in values" :key="val" :value="val">{{ formatDisplayNames ? titleCase(val).replaceAll("_", " ") : titleCase(val) }}</option>
      </select>
    </div>
  </div>
</template>