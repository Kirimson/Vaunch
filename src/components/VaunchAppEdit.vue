<script setup lang="ts">
import VaunchWindow from "./VaunchWindow.vue";
import VaunchButton from "./VaunchButton.vue";
import { onMounted, ref } from "vue";
import { defaultconfig, useConfigStore } from "@/stores/config";
import { VaunchToggleCase } from "@/models/commands/config/VaunchToggleCase";
import { VaunchToggleGui } from "@/models/commands/config/VaunchToggleGui";
import { VaunchToggleCommands } from "@/models/commands/config/VaunchToggleCommands";
import { VaunchToggleFuzzy } from "@/models/commands/config/VaunchToggleFuzzy";
import { VaunchSetColor } from "@/models/commands/config/VaunchsetColor";
import { VaunchFeh } from "@/models/commands/config/VaunchFeh";
import { VaunchSetDefaultSearch } from "@/models/commands/config/VaunchSetDefaultSearch";
import BaseForm from "./form/BaseForm.vue";
import FormSegment from "./form/FormSegment.vue";
import FormCheckBox from "./form/FormCheckBox.vue";
import FormInput from "./form/FormInput.vue";

const emit = defineEmits(["closeEdit"]);
const config = useConfigStore();

const showGui = ref<boolean>(config.showGUI);
const titleCase = ref<boolean>(config.titleCase);
const showCommands = ref<boolean>(config.showCommands);
const fuzzy = ref<boolean>(config.fuzzy);
const defaultFile = ref<string>(config.defaultFile);

const currentBg =
  config.background == defaultconfig.background ? "default" : config.background;
const background = ref<string>(currentBg);


const windowColorConverted = rgbaToHex(config.color.window)

const windowColor = ref(windowColorConverted);
const textColor = ref(config.color.text);
const highlightColor = ref(config.color.highlight);

function rgbaToHex(color: string): string {
  let rgbaMatch = color.match(/rgba\((\d+),\s+(\d+),\s+(\d+),\s+\d+\.\d+\)/);
  if (rgbaMatch) {
    let r = parseInt(rgbaMatch[1]).toString(16).padStart(2, "0");
    let g = parseInt(rgbaMatch[2]).toString(16).padStart(2, "0");
    let b = parseInt(rgbaMatch[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }
  return "default";
}

const closeWindow = () => {
  emit("closeEdit");
};

const saveApp = () => {
  // Set toggle-able settings
  // If the state has changed, toggle the respective setting
  let toggleGui = new VaunchToggleGui();
  if (showGui.value != config.showGUI) toggleGui.execute([]);
  let toggleCase = new VaunchToggleCase();
  if (titleCase.value != config.titleCase) toggleCase.execute([]);
  let toggleCommands = new VaunchToggleCommands();
  if (showCommands.value != config.showCommands)
    toggleCommands.execute([]);
  let toggleFuzzy = new VaunchToggleFuzzy();
  if (fuzzy.value != config.fuzzy) toggleFuzzy.execute([]);
  let setDefaultSearch = new VaunchSetDefaultSearch()
  if (defaultFile.value != config.defaultFile) setDefaultSearch.execute([defaultFile.value])

  let feh = new VaunchFeh();
  if (background.value != currentBg) feh.execute([background.value]);

  let setColor = new VaunchSetColor();

  const newWindowColor = windowColor.value ? windowColor.value : "*"
  const newTextColor = textColor.value ? textColor.value : "*"
  const newHighlightColor = highlightColor.value ? highlightColor.value : "*"
  setColor.execute([newWindowColor, newTextColor, newHighlightColor]);
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
  align-items: center;
}

.edit-label {
  padding-right: 0.5em;
}

.edit-input {
  border: none;
  background: none;
  font-size: 1rem;
  flex-grow: 0;
  width: 30%;
  border-bottom: solid thin v-bind("config.color.text") !important;
  color: v-bind("config.color.text");
}

.edit-input:focus {
  outline: none;
}

.edit-checkbox:checked {
  background-color: v-bind("config.color.highlight");
}
</style>

<template>
  <VaunchWindow title="Vaunch Settings" :icon="'pencil'" v-on:close-window="closeWindow">
    <BaseForm :submit="saveApp">
      <FormSegment title="Behaviour">
        <FormCheckBox label="Toggle if the Folder and Command panes are visible" :checked="showGui" name="Show UI"
          @change="(newVal) => showGui = newVal" />

        <FormCheckBox label="Toggle if the Commands pane is visible" extra-info="Has no effect if 'Show UI' is disabled"
          name="Show Commands" @change="(newVal) => showCommands = newVal" />

        <FormCheckBox label="Toggle 'Title Case' for files and folders" name="Use Title Case" :checked="titleCase"
          @change="(newVal) => titleCase = newVal" />

        <FormCheckBox label="Toggle Fuzzy searching for files" extra-info="If disabled, full filenames must be entered"
          name="Use Fuzzy search" @change="(newVal) => titleCase = newVal" />

      </FormSegment>
      <FormSegment title="Customisation">
        <FormInput label="Set the default Query File when searching" extra-info="Can be the file's path or prefix"
          name="Default search" :value="defaultFile" @change="(newVal) => defaultFile = newVal" />

        <FormInput label="Set the background image" extra-info="Set to 'default' to use the default background"
          name="Background" :value="background" @change="(newVal) => background = newVal" />

        <FormInput label="Set the colourscheme"
          extra-info="Colours can be hex, rgc, or css names. 'default' will reset the colour" name="Window Colour"
          :value="windowColor" @change="(newVal) => windowColor = newVal" />
        <FormInput name="Text Colour" :value="textColor" @change="(newVal) => textColor = newVal" />
        <FormInput name="Highlight Colour" :value="highlightColor" @change="(newVal) => highlightColor = newVal" />
      </FormSegment>
    </BaseForm>
    <div class="edit-buttons">
      <div>
        <VaunchButton icon="save" text="Save" @click="saveApp" />
      </div>
      <div>
        <VaunchButton icon="close" text="Close" @click="closeWindow" />
      </div>
    </div>
  </VaunchWindow>
</template>
