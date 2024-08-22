<script setup lang="ts">
import { VaunchRmdir } from "@/models/commands/fs/VaunchRmdir";
import { ref, reactive, onMounted } from "vue";
import VaunchConfirm from "./VaunchConfirm.vue";
import { useSessionStore } from "@/stores/sessionState";
import VaunchOption from "./VaunchOption.vue";
import VaunchFolderEdit from "./VaunchFolderEdit.vue";
import VaunchFileAdd from "./VaunchFileAdd.vue";
import type { VaunchFolder } from "@/models/VaunchFolder";

const props = defineProps<{
  folder: VaunchFolder
  xPos: number
  yPos: number
}>();
const optionContainer = ref();
const sessionConfig = useSessionStore();

const state = reactive({
  showEdit: false,
  showDelete: false,
  showAdd: false,
});

onMounted(() => {
  if (sessionConfig.action) {
    setWindow(sessionConfig.action, true);
    sessionConfig.action = "";
  }
});

const deleteFolder = () => {
  let rm = new VaunchRmdir();
  let folderPath = `${props.folder.name}`;
  rm.execute(["-f", folderPath]);
  sessionConfig.showFolderOptions = false;
};

const setWindow = (window: string, show: boolean) => {
  switch (window) {
    case "add":
      state.showAdd = show;
      break;
    case "edit":
      state.showEdit = show;
      break;
    case "delete":
      state.showDelete = show;
      break;
  }
  if (show) {
    optionContainer.value.hideOptions();
  } else sessionConfig.showFolderOptions = false;
};

defineExpose({
  setWindow,
});

const shortenTitle = (title: string, maxLength = 12) => {
  if (title.length < maxLength + 3) return title;
  return title.substring(0, maxLength) + "...";
};
</script>

<template>
  <VaunchOption :x-pos="props.xPos" :y-pos="props.yPos" ref="optionContainer">
    <template v-slot:options>
      <div class="option-title">
        <i :class="[
          'fa-' + folder.iconClass,
          'fa-' + folder.icon,
          'option-icon',
        ]"></i>{{ shortenTitle(folder.titleCase()) }}
      </div>

      <div class="options-segment">
        <div class="option-entry" @click="setWindow('add', true)">
          <i class="fa-solid fa-plus option-icon" />Add File
        </div>
        <div class="option-entry" @click="setWindow('edit', true)">
          <i class="fa-solid fa-pencil option-icon" />Edit Folder
        </div>
        <div class="option-entry" @click="setWindow('delete', true)">
          <i class="fa-solid fa-trash option-icon" />Delete Folder
        </div>
      </div>
    </template>

    <template v-slot:windows>
      <VaunchFolderEdit v-if="state.showEdit" :folder="folder" v-on:close-edit="setWindow('edit', false)" />
      <VaunchFileAdd v-if="state.showAdd" :folder="folder" v-on:close-add="setWindow('add', false)" />
      <VaunchConfirm v-if="state.showDelete" v-on:close-window="setWindow('delete', false)"
        v-on:answer-yes="deleteFolder()" v-on:answer-no="setWindow('delete', false)" title="Delete Folder" icon="trash"
        :ask-text="'Delete the ' + folder.titleCase() + ' folder?'" :ask-lines="['This action will permanently delete this folder and all files inside.',
          'This folder contains ' + folder.files.length + ' file' + (folder.files.length != 1 ? 's.' : '.')]" />
    </template>
  </VaunchOption>
</template>
