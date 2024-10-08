<script setup lang="ts">
import { useConfigStore } from "@/stores/config";
import VaunchTooltip from "./VaunchTooltip.vue";
import type { VaunchUrlFile } from "@/models/VaunchUrlFile";
import { ResponseType, type VaunchResponse } from "@/models/VaunchResponse";
import { useSessionStore } from "@/stores/sessionState";
import { focusVaunchInput } from "@/utilities/inputUtils";

const props = defineProps<{
  file: VaunchUrlFile
  isFuzzy?: boolean
  parentFolderName: string
}>();


const config = useConfigStore();
const sessionConfig = useSessionStore();
const safeParentName = props.parentFolderName.toLowerCase().replaceAll(' ', '_')
const emit = defineEmits(["showFileOption"]);

const execute = (file: VaunchUrlFile, args: string[]) => {
  let response: VaunchResponse = file.execute(args);
  if (response.type == ResponseType.UpdateInput) {
    sessionConfig.vaunchInput = response.message;
    focusVaunchInput();
  }
};

const toggleOptions = (event: any) => {
  emit("showFileOption", props.file, event.clientX, event.clientY);
};

const editFile = () => emit("showFileOption", props.file, 0, 0, "edit");
const deleteFile = () => emit("showFileOption", props.file, 0, 0, "delete");
</script>

<style scoped>
.file:hover {
  cursor: pointer;
  background-color: v-bind("config.color.highlight");
}

.filename {
  padding-left: 0.5rem;
}

.fuzzyInfo {
  width: 30%;
}

.description {
  margin-left: 5rem;
  flex: 1;
}

@media (max-width: 768px) {
  .description {
    display: none;
  }

  .fuzzyInfo {
    width: auto;
  }

  .file {
    width: 100%;
  }

  .fileMain {
    flex-grow: 1;
  }
}
</style>

<template>
  <div :key="file.fileName" class="file vaunch-window" @click.exact="execute(file, [])"
    @click.ctrl="execute(file, ['_blank'])" @click.middle.exact="execute(file, ['_blank'])"
    @click.right.prevent.stop.exact="toggleOptions($event)" :id="safeParentName + '-' + file.getIdSafeName()">
    <div :class="{ fuzzyInfo: isFuzzy, fileMain: true }">
      <i :class="['fa-' + file.iconClass, 'fa-' + file.icon, 'file-icon']"></i>
      <span v-if="isFuzzy" class="filename">{{ props.parentFolderName }}:
      </span>
      <span v-if="config.titleCase" :class="{ filename: !isFuzzy }">
        {{ file.titleCase() }}
      </span>
      <span v-if="!config.titleCase" :class="{ filename: !isFuzzy }">
        {{ file.fileName }}
      </span>
    </div>
    <span v-if="isFuzzy" class="description"> {{ file.getDescription() }}</span>
    <span v-if="isFuzzy">Hits: {{ file.hits }}</span>
    <div v-if="!isFuzzy" class="mobile-only mobile-actions">
      <i class="fa-solid fa-pencil" @click.stop="editFile" />
      <i class="fa-solid fa-trash" @click.stop="deleteFile" />
    </div>
    <VaunchTooltip v-if="!isFuzzy" :tip-for="safeParentName + '-' + file.getIdSafeName()" :tip-file="file" />
  </div>
</template>
