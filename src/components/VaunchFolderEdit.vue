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
const props = defineProps(["folder", "addNew"]);

const emit = defineEmits(["closeEdit"]);
const config = useConfigStore();
const folders = useFolderStore();

const newName = ref();
const newPos = ref();
const newIcon = ref();
const newIconClass = ref();
const selectedClass = !props.addNew ? props.folder.iconClass : "solid";

const closeWindow = () => {
  emit("closeEdit");
};

const createFolder = () => {
  // Create the folder
  let mkdir = new VaunchMkdir();

  let newFolderName = (newName.value.value as string)
    .toLowerCase()
    .replace(/\s+/g, "_");
  let response: VaunchResponse = mkdir.execute([newFolderName]);
  if (response.type == ResponseType.Error) return handleResponse(response);

  // Set the folder icon
  let setIcon = new VaunchSetIcon();
  response = setIcon.execute([
    newFolderName,
    newIcon.value.value,
    newIconClass.value.value,
  ]);
  if (response.type == ResponseType.Error) return handleResponse(response);

  // If a position has been set, update the position of the folder
  if (newPos.value.value != '') {
    const setPos = new VaunchSetPosition();
    let response = setPos.execute([newFolderName, newPos.value.value])
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // Once the folder is made, close the window
  closeWindow();
};

const updateFolder = () => {
  // .value.value is used here to get the .value of the reference,
  // a HTMLInputElement, which itself has a .value property
  let folderPath: string = props.folder.name;

  // Edit the icon of the folder
  if (
    newIcon.value.value != props.folder.icon ||
    newIconClass.value.value != props.folder.iconClass
  ) {
    let setIcon = new VaunchSetIcon();
    let response: VaunchResponse = setIcon.execute([
      folderPath,
      newIcon.value.value.toLowerCase(),
      newIconClass.value.value.toLowerCase(),
    ]);
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // If a new position has been set, update the position of the folder
  if (newPos.value.value != folders.findPosition(props.folder.name) + 1) {
    const setPos = new VaunchSetPosition();
    let response = setPos.execute([folderPath, newPos.value.value])
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // If the name of the folder has changed, attempt to move it
  // Do this last so the originalPath variable can be used for all other commands
  if (newName.value.value != props.folder.name) {
    let newFolderName = (newName.value.value as string)
      .toLowerCase()
      .replace(/\s+/g, "_");
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

#edit-form {
  display: flex;
  flex-direction: row;
}

.edit-segment {
  padding: 0.5rem;
  margin: 0.5rem;
  border: solid thin rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  flex: 1;
}

.edit-attr {
  width: 50%;
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
  width: 100%;
  justify-content: left;
}

.edit-input-container {
  display: flex;
  justify-content: left;
}

.edit-label {
  padding-right: 0.5em;
}

.edit-input {
  border: none;
  background: none;
  font-size: 1rem;
  flex-grow: 1;
  border-bottom: solid thin v-bind("config.color.text") !important;
  color: v-bind("config.color.text");
}

.edit-input:focus {
  outline: none;
}
</style>

<template>
  <VaunchWindow
    :title="folder ? `Edit - ${folder.titleCase()}` : 'New Folder'"
    :icon="'pencil'"
    v-on:close-window="closeWindow"
  >
    <div id="edit-container">
      <div class="edit-attributes">
        <form id="edit-form" @submit.prevent="enterSubmit">
          <div class="edit-segment">
            <h2>Folder Properties</h2>

            <div class="edit-attr">
              <span>Name of the folder</span>
              <div class="edit-input-container">
                <label
                  class="edit-label"
                  :for="
                    (props.addNew ? 'new' : folder.getIdSafeName()) +
                    '-foldername'
                  "
                  >Name:
                </label>
                <input
                  autocapitalize="none"
                  autocomplete="off"
                  ref="newName"
                  class="edit-input"
                  type="text"
                  :id="
                    (props.addNew ? 'new' : folder.getIdSafeName()) +
                    '-foldername'
                  "
                  :value="!props.addNew ? folder.name : ''"
                />
              </div>
            </div>

            <div class="edit-attr">
              <span>{{(props.addNew ? 'Set' : 'Change')}} the position of the folder</span>
              <div class="edit-input-container">
                <label
                  class="edit-label"
                  :for="
                    (props.addNew ? 'new' : folder.getIdSafeName()) +
                    '-position'
                  "
                  >Position:
                </label>
                <input
                  autocapitalize="none"
                  autocomplete="off"
                  ref="newPos"
                  class="edit-input"
                  type="text"
                  :id="
                    (props.addNew ? 'new' : folder.getIdSafeName()) +
                    '-position'
                  "
                  :value="!props.addNew ? (folders.findPosition(props.folder.name) + 1) : ''"
                />
              </div>
            </div>

            <div class="edit-attr">
              <span>Icon used for the folder</span>
              <div class="edit-input-container">
                <label
                  class="edit-label"
                  :for="
                    (props.addNew ? 'new' : folder.getIdSafeName()) + '-icon'
                  "
                  >Icon:
                </label>
                <input
                  autocapitalize="none"
                  autocomplete="off"
                  ref="newIcon"
                  class="edit-input"
                  type="text"
                  :id="
                    (props.addNew ? 'new' : folder.getIdSafeName()) + '-icon'
                  "
                  :value="!props.addNew ? folder.icon : 'folder'"
                />
              </div>
            </div>

            <div class="edit-attr">
              <span>Icon class for the folder</span>
              <div class="edit-input-container">
                <label
                  class="edit-label"
                  :for="
                    (props.addNew ? 'new' : folder.getIdSafeName()) +
                    '-icon-class'
                  "
                  >Icon Class:
                </label>
                <select
                  autocapitalize="none"
                  v-model="selectedClass"
                  ref="newIconClass"
                  :id="
                    (props.addNew ? 'new' : folder.getIdSafeName()) +
                    '-icon-class'
                  "
                >
                  <option value="solid">Solid</option>
                  <option value="brands">Brands</option>
                </select>
              </div>
            </div>
          </div>
          <input style="display: none" type="submit" />
        </form>
      </div>
    </div>
    <div class="edit-buttons">
      <div>
        <VaunchButton
          v-if="!props.addNew"
          icon="save"
          text="Save"
          @click="updateFolder"
        />
        <VaunchButton
          v-if="props.addNew"
          icon="add"
          text="Create"
          @click="createFolder"
        />
      </div>
      <div>
        <VaunchButton icon="close" text="Close" @click="closeWindow" />
      </div>
    </div>
  </VaunchWindow>
</template>
