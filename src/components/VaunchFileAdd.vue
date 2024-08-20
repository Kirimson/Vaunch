<script setup lang="ts">
import VaunchWindow from "./VaunchWindow.vue";
import VaunchButton from "./VaunchButton.vue";
import { reactive, ref } from "vue";
import { ResponseType, type VaunchResponse } from "@/models/VaunchResponse";
import { VaunchSetIcon } from "@/models/commands/fs/VaunchSetIcon";
import { VaunchSetDescription } from "@/models/commands/fs/VaunchSetDescription";
import { useConfigStore } from "@/stores/config";
import { handleResponse } from "@/utilities/response";
import { VaunchTouch } from "@/models/commands/fs/VaunchTouch";
import { VaunchSetPosition } from "@/models/commands/fs/VaunchSetPosition";
import BaseForm from "./form/BaseForm.vue";
import FormSegment from "./form/FormSegment.vue";
import FormDropdown from "./form/FormDropdown.vue";
import FormInput from "./form/FormInput.vue";
import { VaunchSed } from "@/models/commands/fs/VaunchSed";
const props = defineProps(["folder"]);

const emit = defineEmits(["closeAdd"]);
const config = useConfigStore();

const fileName = ref("");
const filePrefix = ref("");
const fileContent = ref("");
const filePos = ref("");
const fileIcon = ref("file");
const fileIconClass = ref("solid");
const fileDescription = ref("");
const fileType = ref("lnk")
const fileSedExp = ref("");
const fileSedReplace = ref("");

const closeWindow = () => {
  emit("closeAdd");
};

function missingFieldResponse(fields: string[]) {
  let plural = fields.length > 1;
  return handleResponse({
    type: ResponseType.Error,
    message: `Missing required field${plural ? "s" : ""}: ${fields.join(", ")}`,
    filetype: "VaunchSystem",
    name: "touch",
  });
}

const createFile = () => {
  // Ensure required fields are set
  let missingFields: string[] = [];
  if (fileName.value == "") missingFields.push("Name");
  if (fileType.value == "qry" && filePrefix.value == "")
    missingFields.push("Prefix");
  if (fileContent.value == "") missingFields.push("Content");
  if (missingFields.length > 0) return missingFieldResponse(missingFields);

  // Ensure that the file ends with .<extension> and is in good filename format
  // eg replacing spaces with underscores, and lower case etc...
  const baseName: string = (fileName.value as string)
    .toLowerCase()
    .replace(/\s+/g, "_");
  const fileNameWithExt: string =
    baseName +
    (baseName.endsWith(`.${fileType.value}`) ? "" : `.${fileType.value}`);
  const filePath = `${props.folder.name}/${fileNameWithExt}`

  // After checks have passed, touch the file, prefixing the file's folder
  let touch = new VaunchTouch();
  let args: string[] = [];
  args.push(filePath); // Filename is first
  if (fileType.value == "qry") args.push(filePrefix.value) // Then prefix if a query file
  args.push(fileContent.value); // Finally the link

  let response: VaunchResponse = touch.execute(args);
  if (response.type == ResponseType.Error) return handleResponse(response);

  // If the file was made successfully, perform all other customisation for the file
  // Edit the icon of the file
  if (fileIcon.value != "" || fileIconClass.value != "") {
    let setIcon = new VaunchSetIcon();
    let response: VaunchResponse = setIcon.execute([
      filePath,
      fileIcon.value.toLowerCase(),
      fileIconClass.value.toLowerCase(),
    ]);
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // Edit the description of the file
  if (fileDescription.value != "") {
    let setDesc = new VaunchSetDescription();
    let response: VaunchResponse = setDesc.execute([
      filePath,
      fileDescription.value,
    ]);
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // If a position has been set, update the position of the file
  if (filePos.value != '') {
    const setPos = new VaunchSetPosition();
    let response = setPos.execute([filePath, filePos.value])
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // If sed has been set and a query file, set sed exprssion
  if (fileSedExp.value && fileType.value == 'qry') {
    let sed = new VaunchSed();
    let response = sed.execute([filePath, fileSedExp.value, fileSedReplace.value])
    if (response.type == ResponseType.Error) return handleResponse(response);
  }

  // Once the file is created, close the window
  closeWindow();
};
</script>

<style scoped>
#edit-container {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
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
  width: 100%;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
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

.create-file-container {
  display: flex;
  flex-direction: row;
}

.edit-label {
  padding-right: 0.5em;
}

.edit-input {
  width: 50%;
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

#create-file-header {
  padding: 0 1rem;
}

@media (max-width: 768px) {
  .create-file-container {
    flex-direction: column;
  }
}
</style>

<template>
  <VaunchWindow :title="folder.titleCase() + ': Create File'" :icon="folder.icon" :icon-class="folder.iconClass"
    v-on:close-window="closeWindow">
    <BaseForm :submit="createFile">

      <FormSegment full-width title="Create a new file">
        <FormDropdown name="File Type" :value="fileType"
          :values-map="[{ k: 'lnk', v: 'Link File' }, { k: 'qry', v: 'Query File' }]"
          @change="(newVal) => fileType = newVal" />
        <p v-if="fileType == 'qry'">
          Query Files substitute your input within a link, replacing <code>${}</code> or <code>${1}</code>,
          <code>${2}</code> etc if multiple input arguments are needed.<br />
          Treat them like custom search engines. Invoked by either filename or by a prefix you set.
        </p>
        <p v-else>
          Link Files are a simple link to a set site, they cannot be customised like query files.<br />
          Treat them like bookmarks. Invoked by filename
        </p>
      </FormSegment>

      <FormSegment title="File Content">
        <FormInput label="Name of the file" name="Name" @change="(newVal) => fileName = newVal" />

        <FormInput v-if="fileType == 'qry'" label="Shorthand prefix for the file" name="Prefix"
          @change="(newVal) => filePrefix = newVal" />

        <FormInput v-if="fileType == 'qry'" label="Sed expression for the file" name="Sed Expression"
          @change="(newVal) => fileSedExp = newVal" />

        <FormInput v-if="fileType == 'qry'" name="Sed Replace" @change="(newVal) => fileSedReplace = newVal" />

        <FormInput label="Destination of the link" name="Destination" @change="(newVal) => fileContent = newVal" />
      </FormSegment>

      <FormSegment title="File Customisation">
        <FormInput label="Postion of the file in the folder" name="Position" @change="(newVal) => filePos = newVal" />

        <FormInput label="Icon of the file" name="Icon Name" :value="fileType == 'lnk' ? 'file' : 'magnifying-glass'"
          @change="(newVal) => fileIcon = newVal" />
        <FormDropdown name="Icon Class" :value="fileIconClass" :values="['solid', 'brands']"
          @change="(newVal) => fileIconClass = newVal" />

        <FormInput label="Description of the file" name="File Description"
          @change="(newVal) => fileDescription = newVal" />
      </FormSegment>
    </BaseForm>
    <div class="edit-buttons">
      <div>
        <VaunchButton icon="plus" text="Create" @click="createFile" />
      </div>
      <div>
        <VaunchButton icon="close" text="Close" @click="closeWindow" />
      </div>
    </div>
  </VaunchWindow>
</template>
