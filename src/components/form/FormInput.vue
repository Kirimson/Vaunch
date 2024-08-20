<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import { getCurrentInstance } from 'vue';

defineProps<{
  label?: string
  name: string
  value?: string
  placeholder?: string
  extraInfo?: string
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
@import url("@/components/form/form.css");

.container:after {
  display:block;
  content: '';
  border-bottom: solid 2px v-bind("config.color.highlight");
  border-radius: 50px;
  transform: scaleX(0);
  transition: transform 150ms ease-in-out;
}

.container:focus-within:after {
  transform: scaleX(1);
  border-radius: 50px;
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
    <span class="description" v-if="label">{{ label }}</span>
    <span class="extra-info" v-if="extraInfo">{{ extraInfo }}</span>
    <div class="input-container">
      <label :for="instance?.uid+'-filename'">{{ name }}:</label>
      <input autocapitalize="none" autocomplete="off" type="text" :placeholder="placeholder"
        :id="instance?.uid+'-filename'" :value="value" @input="handleChange($event.target as HTMLInputElement)" />
    </div>
  </div>
</template>