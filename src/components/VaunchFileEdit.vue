<script setup lang="ts">
import VaunchWindow from "./VaunchWindow.vue";
import VaunchButton from "./VaunchButton.vue";
import { ref } from "vue";
import { VaunchMv } from "@/models/commands/fs/VaunchMv";
import { ResponseType, type VaunchResponse } from "@/models/VaunchResponse";
import { VaunchEditFile } from "@/models/commands/fs/VaunchEditFile";
import { VaunchSetIcon } from "@/models/commands/fs/VaunchSetIcon";
import { VaunchSetDescription } from "@/models/commands/fs/VaunchSetDescription";
import { handleResponse } from "@/utilities/response";
import { VaunchSetPosition } from "@/models/commands/fs/VaunchSetPosition";
import { useFolderStore } from "@/stores/folder";
import type { VaunchFolder } from "@/models/VaunchFolder";
import { VaunchSed } from "@/models/commands/fs/VaunchSed";
import BaseForm from "./form/BaseForm.vue";
import FormSegment from "./form/FormSegment.vue";
import type { VaunchLink } from "@/models/VaunchLink";
import { VaunchQuery } from "@/models/VaunchQuery";
import FormInput from "./form/FormInput.vue";
import FormDropdown from "./form/FormDropdown.vue";

const props = defineProps<{
  file: VaunchLink | VaunchQuery
  folderName: string
}>();

const emit = defineEmits(["closeEdit"]);
const folders = useFolderStore()
const allFolders = folders.folderNames

const parentFolder: VaunchFolder = folders.getFolderByName(props.folderName)

const initialPosition = ref(parentFolder.findFilePosition(props.file.fileName));

const fileName = ref(props.file.fileName);
const fileFolder = ref(props.folderName);
const fileContent = ref(props.file.content);
const filePos = ref(parentFolder.findFilePosition(props.file.fileName) + 1);
const fileIcon = ref(props.file.icon);
const fileIconClass = ref(props.file.iconClass);

const filePrefix = ref(props.file instanceof VaunchQuery ? props.file.prefix : "");
const fileSedExp = ref(props.file instanceof VaunchQuery ? props.file.sed[0] : "");
const fileSedReplace = ref(props.file instanceof VaunchQuery ? props.file.sed[1] : "");
const fileDescription = ref(props.file.description);

const closeWindow = () => {
  emit("closeEdit");
};

const saveFile = () => {
  let originalPath = `${props.folderName}/${props.file.fileName}`;

  // Edit the content of the file, if prefix is present, it is a query file
  // and should be the first arg after the filename
  let editArgs: string[] = [];

  // If a QueryFile, check for specific extra parameters
  if (props.file instanceof VaunchQuery) {
    if (filePrefix.value) {
      // If prefix has changed, add it to the editArgs
      if (filePrefix.value != props.file.prefix) {
        editArgs.push(filePrefix.value);
      } else editArgs.push("*");
    }
    // Edit the sed expression of the file if changed
    // If sed has changed, run sed against the file
    if (fileSedExp.value != props.file.sed[0]) {
      let sed = new VaunchSed();
      let response = sed.execute([originalPath, fileSedExp.value, fileSedReplace.value])
      if (response.type == ResponseType.Error) return handleResponse(response);
    }
  }

  // If the link content has changed, add it to the editArgs
  if (fileContent.value != props.file.content) editArgs.push(fileContent.value);

  if (editArgs.length > 0) {
    // Edit the file, using the originalPath to get to the file
    let edit = new VaunchEditFile();
    let response: VaunchResponse = edit.execute([originalPath, ...editArgs]);
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // Edit the icon of the file
  if (fileIcon.value != props.file.icon || fileIconClass.value != props.file.iconClass) {
    let setIcon = new VaunchSetIcon();
    let response: VaunchResponse = setIcon.execute([
      originalPath,
      fileIcon.value.toLowerCase(),
      fileIconClass.value.toLowerCase(),
    ]);
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // Edit the description of the file
  if (fileDescription.value != props.file.description) {
    let setDesc = new VaunchSetDescription();
    let response: VaunchResponse = setDesc.execute([originalPath, fileDescription.value]);
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // If a position has been set, update the position of the file
  // Adding one to get "human" position rather than positional index
  if (filePos.value != parentFolder.findFilePosition(props.file.fileName) + 1) {
    const setPos = new VaunchSetPosition();
    let response = setPos.execute([originalPath, filePos.value.toString()])
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // If the name/folder of the file has changed, attempt to move it
  // Do this last so the originalPath variable can be used for all other commands
  let newFolderName = fileFolder.value.toLowerCase().replace(/\s+/g, "_");
  if (newFolderName != props.folderName || fileName.value != props.file.fileName) {
    // Ensure that the file ends with .<extension> and is in good filename format
    // eg replacing spaces with underscores, and lower case etc...
    let newFileName: string = (fileName.value as string).toLowerCase().replace(/\s+/g, "_");
    let newPath = `${newFolderName}/${newFileName}`;
    let mv = new VaunchMv();
    let response: VaunchResponse = mv.execute([originalPath, newPath]);
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // Once all edits are made, close the window
  closeWindow();
};
</script>

<style scoped>
#edit-container {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  flex-grow: 1;
}

.edit-buttons {
  display: flex;
  justify-content: center;
  border-top: solid thin rgba(0, 0, 0, 0.25);
  padding: 0.5rem 0;
}

.edit-buttons div {
  margin: 0 0.5rem;
}

.edit-attributes {
  overflow: auto;
  padding: 0 1rem;
}
</style>

<template>
  <VaunchWindow :title="'Edit - ' + file.titleCase()" :icon="'pencil'" v-on:close-window="closeWindow">
    <div id="edit-container">
      <div class="edit-attributes">
        <BaseForm :submit=saveFile>
          <FormSegment title="File Content">
            <FormInput label="Edit the name of the file" name="Name" :value="fileName"
              @change="(newVal: string) => fileName = newVal" />

            <FormDropdown label="Edit the folder the file is in" name="Folder" :value="fileFolder"
              :values="allFolders" :format-display-names="true" @change="(newVal: string) => fileFolder = newVal" />

            <FormInput v-if="file instanceof VaunchQuery" label="Edit the prefix used for the file" name="Prefix"
              :value="filePrefix" @change="(newVal: string) => filePrefix = newVal" />

            <FormInput v-if="file instanceof VaunchQuery" label="Edit the sed expression for the file"
              name="Sed Expression" :value="fileSedExp" @change="(newVal: string) => fileSedExp = newVal" />
            <FormInput v-if="file instanceof VaunchQuery" name="Sed Replace" :value="fileSedReplace"
              @change="(newVal: string) => fileSedReplace = newVal" />

            <FormInput label="Edit the destination of the file" name="Destination" :value="fileContent"
              @change="(newVal: string) => fileContent = newVal" />

          </FormSegment>

          <FormSegment title="File Customisation">
            <FormInput label="Set the position of the file" name="Position" :value="(initialPosition + 1).toString()"
              @change="(newVal: string) => filePos = parseInt(newVal)" />

            <FormInput label="Edit the icon of the file" name="Icon Name" :value="fileIcon"
              @change="(newVal: string) => fileIcon = newVal" />
            <FormDropdown name="Icon Type" :value="fileIconClass" :values="['solid','brands']"
              @change="(newVal: string) => fileIconClass = newVal" />

            <FormInput label="Edit the description for the file" name="File Description" :value="fileDescription"
              @change="(newVal: string) => fileDescription = newVal" />
          </FormSegment>

          <input style="display: none" type="submit" />
        </BaseForm>
      </div>
    </div>
    <div class="edit-buttons">
      <div>
        <VaunchButton icon="save" text="Save" @click="saveFile" />
      </div>
      <div>
        <VaunchButton icon="close" text="Close" @click="closeWindow" />
      </div>
    </div>
  </VaunchWindow>
</template>
