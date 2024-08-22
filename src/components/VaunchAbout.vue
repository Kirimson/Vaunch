<script setup lang="ts">
import VaunchWindow from "./VaunchWindow.vue";
import VaunchButton from "./VaunchButton.vue";

const appVersion = import.meta.env.VITE_APP_VERSION;
const appBuildDate = import.meta.env.VITE_APP_BUILD_DATE;

const emit = defineEmits(["closeWindow"]);

const icons = ["heart","burger","mug-hot","keyboard","computer","hammer"]

const i = Math.floor(Math.random() * icons.length)
</script>

<style scoped>
#about-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

#about-text {
  margin: 0.5em;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  align-items: center;
  font-size: larger;
}

.confirm-buttons {
  display: flex;
  justify-content: center;
  border-top: solid thin rgba(0, 0, 0, 0.25);
  flex: 0;
}

#build-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  align-items: center;
}

#source-link {
  color: inherit;
}

#self-icon {
  padding: 0 0.1em;
}
</style>

<template>
  <VaunchWindow :small="true" title="About" icon="question-circle" v-on:close-window="emit('closeWindow')">
    <div id="about-container">
      <div id="about-text">
        <span>
          Vaunch, a command driven and customisable Start Page
        </span>
        <div id="build-info">
          <span>
            Version: {{ appVersion ? appVersion : "Dev" }}
          </span>
          <span>
            Build date: {{ appBuildDate ? appBuildDate : 'Now' }}
          </span>
        </div>
        <span>
          View source code on
          <a id="source-link" href="https://github.com/kirimson/Vaunch">Github</a>
        </span>
        <span>
          Made with <i id="self-icon" :class="'fa-solid fa-' + icons[i]"></i> by <a id="source-link"
            href="https://github.com/kirimson">Kirimson</a>
        </span>
      </div>
      <div class="confirm-buttons">
        <div>
          <VaunchButton text="Close" @click="emit('closeWindow')" />
        </div>
      </div>
    </div>
  </VaunchWindow>
</template>
