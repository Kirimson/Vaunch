<script setup lang="ts">
import VaunchWindow from "./VaunchWindow.vue";
import VaunchButton from "./VaunchButton.vue";
import { ref } from "vue";
import { useConfigStore } from "@/stores/config";
import { useFolderStore } from "@/stores/folder";
import { VaunchSetIcon } from "@/models/commands/fs/VaunchSetIcon";
import { type VaunchResponse, ResponseType } from "@/models/VaunchResponse";
import { handleResponse } from "@/utilities/response";
import { VaunchMv } from "@/models/commands/fs/VaunchMv";
import { VaunchMkdir } from "@/models/commands/fs/VaunchMkdir";
import { VaunchSetPosition } from "@/models/commands/fs/VaunchSetPosition";
import BaseForm from "./form/BaseForm.vue";
import FormSegment from "./form/FormSegment.vue";
import FormInput from "./form/FormInput.vue";
import FormDropdown from "./form/FormDropdown.vue";
import type { VaunchFolder } from "@/models/VaunchFolder";

const props = defineProps<{
  folder?: VaunchFolder,
  addNew: boolean
}>();

const emit = defineEmits(["closeEdit"]);
const config = useConfigStore();
const folders = useFolderStore();

const folderName = ref(!props.addNew ? props.folder!!.name : '');
const folderPos = ref(!props.addNew ? String(folders.findPosition(props.folder?.name) + 1) : '');
const folderIcon = ref(!props.addNew ? props.folder!!.icon : 'folder');
const folderIconClass = ref(!props.addNew ? props.folder!!.iconClass : "solid");

const closeWindow = () => {
  emit("closeEdit");
};

const createFolder = () => {
  // Create the folder
  let mkdir = new VaunchMkdir();

  let newFolderName = (folderName.value as string)
    .toLowerCase()
    .replace(/\s+/g, "_");
  let response: VaunchResponse = mkdir.execute([newFolderName]);
  if (response.type == ResponseType.Error) return handleResponse(response);

  // Set the folder icon
  let setIcon = new VaunchSetIcon();
  response = setIcon.execute([
    newFolderName,
    folderIcon.value,
    folderIconClass.value,
  ]);
  if (response.type == ResponseType.Error) return handleResponse(response);

  // If a position has been set, update the position of the folder
  if (folderPos.value != '') {
    const setPos = new VaunchSetPosition();
    let response = setPos.execute([newFolderName, folderPos.value])
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // Once the folder is made, close the window
  closeWindow();
};

const updateFolder = () => {
  if (!props.folder) {
    return
  }
  let folderPath: string = props.folder.name;

  // Edit the icon of the folder
  if (
    folderIcon.value != props.folder.icon ||
    folderIconClass.value != props.folder.iconClass
  ) {
    let setIcon = new VaunchSetIcon();
    let response: VaunchResponse = setIcon.execute([
      folderPath,
      folderIcon.value.toLowerCase(),
      folderIconClass.value.toLowerCase(),
    ]);
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // If a new position has been set, update the position of the folder
  if (folderPos.value != folders.findPosition(props.folder.name) + 1) {
    const setPos = new VaunchSetPosition();
    let response = setPos.execute([folderPath, folderPos.value])
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // If the name of the folder has changed, attempt to move it
  // Do this last so the originalPath variable can be used for all other commands
  if (folderName.value != props.folder.name) {
    let newFolderName = folderName.value.toLowerCase().replace(/\s+/g, "_");
    let mv = new VaunchMv();
    let response: VaunchResponse = mv.execute([folderPath, newFolderName]);
    if (response.type == ResponseType.Error) return handleResponse(response);
  }
  // Once all edits are made, close the window
  closeWindow();
};

const enterSubmit = () => {
  if (props.addNew) {
    createFolder();
  } else updateFolder();
};
</script>

<style scoped>
.edit-buttons {
  display: flex;
  justify-content: center;
  border-top: solid thin rgba(0, 0, 0, 0.25);
  padding: 0.5rem 0;
}

.edit-buttons div {
  margin: 0 0.5rem;
}
</style>

<template>
  <VaunchWindow :title="folder ? `Edit - ${folder.titleCase()}` : 'New Folder'" :icon="'pencil'"
    v-on:close-window="closeWindow">
    <BaseForm @submit="enterSubmit">
      <FormSegment full-width title="Folder Details">
        <FormInput label="Name of the folder" name="Folder Name" :value="folderName"
          @change="(newVal) => folderName = newVal" />

        <FormInput label="Position of the folder" name="Position" :value="folderPos"
          @change="(newVal) => folderPos = newVal" />

        <FormInput label="Icon of the folder" name="Icon Name" :value="folderIcon"
          @change="(newVal) => folderIcon = newVal" />
        <FormDropdown name="Icon Class" :value="folderIconClass" :values="['solid', 'brands']"
          @change="(newVal) => folderIconClass = newVal" />
      </FormSegment>
      <input style="display: none" type="submit" />
    </BaseForm>
    <div class="edit-buttons">
      <div>
        <VaunchButton v-if="!props.addNew" icon="save" text="Save" @click="updateFolder" />
        <VaunchButton v-if="props.addNew" icon="add" text="Create" @click="createFolder" />
      </div>
      <div>
        <VaunchButton icon="close" text="Close" @click="closeWindow" />
      </div>
    </div>
  </VaunchWindow>
</template>
