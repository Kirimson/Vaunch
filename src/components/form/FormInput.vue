<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import { getCurrentInstance } from 'vue';

defineProps<{
  label?: string
  name: string
  value: string
}>();

const emit = defineEmits<{
  change: [value: string]
}>();

const config = useConfigStore();
const instance = getCurrentInstance()

const handleChange = (event:HTMLInputElement) => {
  emit("change", event.value)
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

.container:after {
  display:block;
  content: '';
  border-bottom: solid 2px v-bind("config.color.highlight");
  transform: scaleX(0);
  transition: transform 100ms ease-in-out;
}

.container:focus-within:after {
  transform: scaleX(1);
}
</style>

<template>
  <div class="container">
    <span v-if="label">{{ label }}</span>
    <div class="input-container">
      <label :for="instance?.uid+'-filename'">{{ name }}:</label>
      <input autocapitalize="none" autocomplete="off" type="text"
        :id="instance?.uid+'-filename'" :value="value" @input="handleChange($event.target as HTMLInputElement)" />
    </div>
  </div>
</template>