<script setup lang="ts">
import VaunchWindow from "./VaunchWindow.vue";
import VaunchButton from "./VaunchButton.vue";

const props = defineProps<{
  title: string
  askText?: string
  askLines?: string[]
  icon: string
}>();

const emit = defineEmits(["closeWindow", "answerYes", "answerNo"]);
</script>

<style scoped>
.confirm-header {
  align-self: center;
  font-size: x-large;
  padding: 1em;
  padding-bottom: 0;
}

.confirm-text {
  padding: 1em;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  flex: 1;
  font-size: larger;
  text-align: center;
}

.confirm-line {
  padding: 0.1em 0;
}

.confirm-container {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.confirm-buttons {
  display: flex;
  justify-content: center;
  border-top: solid thin rgba(0, 0, 0, 0.25);
  flex: 0;
}
</style>

<template>
  <VaunchWindow :small="true" :title="title" :icon="icon" v-on:close-window="emit('closeWindow')">
    <div class="confirm-container">
      <div v-if="props.askText" class="confirm-header">
        {{ askText }}
      </div>
      <div v-if="props.askLines" class="confirm-text">
        <span class="confirm-line" v-for="line in props.askLines" :key="line">{{ line }}</span>
      </div>
      <div class="confirm-buttons">
        <div>
          <VaunchButton icon="check" text="Yes" @click="emit('answerYes')" />
        </div>
        <div>
          <VaunchButton icon="close" text="No" @click="emit('answerNo')" />
        </div>
      </div>
    </div>
  </VaunchWindow>
</template>
