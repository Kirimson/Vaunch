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

const handleChange = (event:HTMLSelectElement) => {
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

</style>

<template>
  <div class="container">
    <span v-if="label">{{ label }}</span>
    <div class="input-container">
      <label :for="instance?.uid+'-filename'">{{ name }}:</label>
      <select @input="handleChange($event.target as HTMLSelectElement)" ref="newIconClass" id="new-icon-class">
        <option value="solid">Solid</option>
        <option value="brands">Brands</option>
      </select>
    </div>
  </div>
</template>