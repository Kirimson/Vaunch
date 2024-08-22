<script setup lang="ts">
import { useConfigStore } from "@/stores/config";
import { useFolderStore } from "@/stores/folder";
import { ref, watch } from "vue";
import VaunchGuiFile from "./VaunchGuiFile.vue";
import type { FuzzyEntry } from "@/stores/fuzzy";

const props = defineProps<{
  fuzzyMatches: FuzzyEntry[]
  currentIndex: number
}>();
const config = useConfigStore();
const files = ref();
const folders = useFolderStore()

const getCurrentIndex = () => props.currentIndex;

watch(getCurrentIndex, (newIndex: number) => {
  let fileElement = files.value as typeof VaunchGuiFile[];

  // Get the selected filename from the fizzy matches
  // This is the only source of truth with array ordering.
  // fileElement itself is a ref with a list of elements, but for some reason
  // when changing back and forth between input values it messes ordering up???
  // Either way, fileElement[newIndex] is a false prophet and does not always work
  const selectedFile = props.fuzzyMatches[newIndex];
  const selectedIdName = `${selectedFile.folder}-${selectedFile.file.getIdSafeName()}`

  // For some reason unknown to me, mapping to .$el seems the 'best' way to
  // get a simple list of these HTMLElements (the only type that has offsetTop)
  const elements = fileElement.map((elem) => elem.$el)
  // Find the correct element based on the newly selected filename
  let elem = (elements.find((elem) => elem.id == selectedIdName) as HTMLElement)
  let parent: HTMLElement | null = elem.parentElement;
  // parentElement can be null, so we need to wrap this in an if so ts is happy
  if (parent) {
    let topPos = elem.offsetTop - parent.offsetTop;
    parent.scroll({
      top: topPos,
      behavior: "smooth",
    });
  }
});
</script>

<style>
#fuzzy-container {
  position: absolute;
  top: 22.5vh;
  display: flex;
  flex-direction: column;
  width: 75vw;
  max-height: 35vh;
  margin-bottom: 1em;
  z-index: 9;
}

.fuzzy-no-gui {
  top: 55vh !important;
}

#fuzzy-title {
  position: relative;
  width: 100%;
  padding-left: 1em;
  font-size: 1.2rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 5px 5px 0 0;
}

#fuzzy-title span {
  padding-left: 0.5rem;
}

#fuzzy-file-container {
  justify-content: left;
  justify-items: left;
  flex-direction: row;
  flex-wrap: wrap;
}

#fuzzy-file-container .file {
  width: 100%;
}

.highlight {
  background-color: v-bind("config.color.highlight") !important;
}

@media (max-width: 768px) {
  #fuzzy-container {
    width: 80vw;
  }
}

/* Small devices (landscape phones, 576px and up) */
@media (max-width: 576px) {
  #fuzzy-container {
    width: 95vw;
  }
}
</style>

<template>
  <div id="fuzzy-container" :class="{ 'vaunch-window': true, 'vaunch-solid-bg': true, 'fuzzy-no-gui': !config.showGUI }">
    <span class="folder-title">
      <i class="fa-solid fa-magnifying-glass"></i>
      <span class="folder-name">Fuzzy Search</span>
    </span>
    <div class="file-container" id="fuzzy-file-container">
      <VaunchGuiFile ref="files" :class="{ highlight: fuzzyEntry === fuzzyMatches[currentIndex] }"
        v-for="fuzzyEntry in fuzzyMatches" :key="fuzzyEntry.file.fileName" :file="fuzzyEntry.file"
        :parent-folder-name="folders.getFolderByName(fuzzyEntry.folder).titleCase()" :is-fuzzy="true" />
    </div>
  </div>
</template>
