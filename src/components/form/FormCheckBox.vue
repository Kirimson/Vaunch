<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import { getCurrentInstance } from 'vue';

defineProps<{
  label?: string
  name: string
  checked?: boolean
  placeholder?: string
  extraInfo?: string
}>();

const emit = defineEmits<{
  change: [value: boolean]
}>();

const config = useConfigStore();
const instance = getCurrentInstance()

const handleChange = (event: HTMLInputElement) => {
  emit("change", event.checked)
}
</script>

<style scoped>
@import url("@/components/form/form.css");

.checkbox-container {
  display: flex;
  padding: 0.25em;
}

.checkox-label {
  opacity: 1;
}

input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  width: 1.5em;
  height: 1.5em;
  border-radius: 5px;
  display: grid;
  place-content: center;
}

input[type="checkbox"]::before {
  content: "";
  width: 1.5em;
  height: 1.5em;
  background-color: rgba(150, 150, 150, 0.25);
  border: solid thin rgba(100, 100, 100, 0.25);
  border-radius: 5px;
}

input[type="checkbox"]:checked {
  background-color: v-bind("config.color.highlight") !important;
}

input[type="checkbox"]:checked::before {
  visibility: visible;
  width: 1em;
  height: 1em;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  background-color: v-bind("config.color.text");
}
</style>

<template>
  <div class="container">
    <span class="description" v-if="label">{{ label }}</span>
    <span class="extra-info" v-if="extraInfo">{{ extraInfo }}</span>
    <div class="checkbox-container">
      <label class="checkox-label" :for="instance?.uid + '-checkbox'">{{ name }}:</label>
      <input autocomplete="off" type="checkbox" :id="instance?.uid + '-checkbox'" :checked="checked"
        @input="handleChange($event.target as HTMLInputElement)" />
    </div>
  </div>
</template>