<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import { useConfigStore } from '@/stores/config';

const props = defineProps<{
  label?: string
  name: string
  value: string
  values?: string[]
  valuesMap?: {k: string, v: string}[]
  formatDisplayNames?: boolean
}>();

const emit = defineEmits<{
  change: [value: string]
}>();

const config = useConfigStore();
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

select:focus {
  outline: none;
}

.input-container {
  content: '';
  outline: solid 0px v-bind("config.color.highlight");
  border-radius: 5px;
  transition: outline 75ms ease-in-out;
}

.input-container:focus-within {
  outline: solid 2px v-bind("config.color.highlight");
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
        <option v-for="val in valuesMap" :key="val.k" :value="val.k">{{ formatDisplayNames ? titleCase(val.v).replaceAll("_", " ") : titleCase(val.v) }}</option>
      </select>
    </div>
  </div>
</template>