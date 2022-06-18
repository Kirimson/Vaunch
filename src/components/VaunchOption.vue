<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import { useSessionStore } from '@/stores/sessionState';
import { ref, onMounted, onUpdated } from 'vue'

const props = defineProps(['xPos', 'yPos'])
const sessionConfig = useSessionStore();
const option = ref()
const optionContainer = ref();
const config = useConfigStore();

onMounted(() => {
  let element: HTMLElement = option.value;
  let lowerSixth = window.innerHeight - (window.outerHeight / 6);
  if (props.yPos > lowerSixth) {
    let bottomPos = window.innerHeight - props.yPos;
    element.style.bottom = `${bottomPos}px`;
  } else {
    element.style.top = `${props.yPos}px`;
  }
  element.style.left = `${props.xPos}px`;
})

onUpdated(() => {
  let element: HTMLElement = option.value;
  element.style.top = `${props.yPos}px`;
  element.style.left = `${props.xPos}px`;
})

const dismiss = () => {
  sessionConfig.showFileOptions = false;
  sessionConfig.showFolderOptions = false;
}

// Exposed method to hide the options container, can be called
// when clicking on options from the parent component
const hideOptions = () => {
  (optionContainer.value as HTMLElement).style.display = "none";
}
defineExpose({
  hideOptions
})
</script>

<style>

.option-outer {
  position: absolute;
}
.vaunch-option {
  max-width: 15em;
  min-width: 7em;
  word-break: break-all;
  height: auto;
  z-index: 10;
  border: solid thin rgba(100, 100, 100, 0.25);
  overflow: visible;
}

.options-container div {
  background-color: inherit;
}

.options-container {
  border-radius: inherit;
  background-color: inherit;
  padding: 0.5em 0;
}


.options-container .options-segment:not(:last-child) {
  padding-bottom: 0.5rem;
  border-bottom: solid 1px rgba(0, 0, 0, 0.25);
}

.option-title {
  padding: 0 0.5em 0.5em 0.5em;
  border-bottom: solid 1px rgba(0, 0, 0, 0.25);
}

.option-icon {
  padding-right: 0.5em;
  width: 1.5rem;
}

.options-segment {
  margin-top: 0.5em;
}

.option-entry {
  transition: background-color 0.15s;
}
.option-entry:hover {
  cursor: pointer;
  background: v-bind("config.color.highlight");
}

.option-entry {
  padding: 0 0.5em;
}

</style>

<template>
  <div class="option-outer" v-click-away="dismiss" ref="option">
    <div class="vaunch-option vaunch-window vaunch-solid-bg" ref="optionContainer">
      <div class="options-container">
        <slot name="options"></slot>
      </div>
    </div>
    <slot name="windows"></slot>
  </div>
</template>