<script setup lang="ts">
import VaunchInput from "@/components/VaunchInput.vue";
import VaunchGuiFolder from "./components/VaunchGuiFolder.vue";

import { commands } from "@/stores/command";
import { useConfigStore } from "@/stores/config";
import { useFolderStore } from "@/stores/folder";
import { VaunchFolder } from "./models/VaunchFolder";
import { VaunchFile } from "./models/VaunchFile";
import { reactive, ref, computed } from "vue";
import draggable from 'vuedraggable'
import { useFuzzyStore, type FuzzyEntry } from "./stores/fuzzy";
import VaunchFuzzy from "./components/VaunchFuzzy.vue";
import VaunchGuiCommands from "./components/VaunchGuiCommands.vue";
import VaunchMan from "./components/VaunchMan.vue";
import { VaunchLink } from "./models/VaunchLink";

import { useSessionStore } from "@/stores/sessionState";
import type { VaunchResponse } from "./models/VaunchResponse";
import { ResponseType } from "./models/VaunchResponse";
import VaunchGuiResponse from "./components/VaunchGuiResponse.vue";
import VaunchFileOption from "./components/VaunchFileOption.vue";
import VaunchFolderOption from "./components/VaunchFolderOption.vue";
import VaunchAppOption from "./components/VaunchAppOption.vue";
import type { VaunchUrlFile } from "./models/VaunchUrlFile";
import { handleResponse } from "./utilities/response";

const config = useConfigStore();
const folders = useFolderStore();
const fuzzyFiles = useFuzzyStore();
const sessionConfig = useSessionStore();

const vaunchInput = ref();
const folderOption = ref();

let optionFile: VaunchFile = reactive(new VaunchLink("default", "default"));
let optionFolder: VaunchFolder = reactive(new VaunchFolder("default"));
const data = reactive({
  optionFile,
  optionFileFolder: "",
  optionFolder,
  action: "",
  optionX: 0,
  optionY: 0,
  prefixName: config.prefix.name,
  prefixClass: config.prefix.class,
});

const folderList = computed<VaunchFolder[]>({
  get():VaunchFolder[] {
    return folders.rawFolders;
  },
  set(value) {
    folders.setFolders(value);
  }
})

const executeCommand = (commandArgs: string[], newTab = false) => {
  // Before all else, push this command to Vaunch's history
  sessionConfig.history.unshift(commandArgs.join(" "));
  let operator = commandArgs[0];
  commandArgs.shift();
  
  // Check if we're running a command, if we find it in commands, execute it
  for (let command of commands) {
    if (command.getNames().includes(operator)) {
      return handleResponse(command.execute(commandArgs));
    }
  }

  // If ctrl was held, append _black to commandArgs
  if (newTab) commandArgs.push("_blank");

  // If no command was found, could it be a qry file?
  let file = folders.findQryFile(operator);
  if (file) {
    // If the first parameter was supplied in the same 'word' as the prefix, unshift
    // it into the commandArgs. This deals with a multi ${} file, executed like:
    // prefix:firstArg secondArg
    if (operator.split(":")[1]) commandArgs.unshift(operator.split(":")[1]);
    return handleResponse(file.execute(commandArgs));
  }

  // If no command was found, let's check if we're running a file
  if (operator.includes("/")) {
    let file: VaunchFile = folders.getFileByPath(operator);
    if (file) {
      return handleResponse(file.execute(commandArgs));
    }
  }

  // If a fuzzy file has been chosen, let's execute that
  if (fuzzyFiles.items.length > 0 && config.fuzzy) {
    // Also shift this entry off the history, in case it was a qry file
    sessionConfig.history.shift();
    let response = fuzzyFiles.items[fuzzyFiles.index].file.execute(commandArgs);
    return handleResponse(response);
  }

  // If the input is a valid URL, navigate to it. Create a temporary VaunchLink with the operator and commandArgs
  // then attempt to run the file. If it isn't a valid URL nothing will happen, if it is, the url is navigated to.
  let urlValue: string = [operator, ...commandArgs].join(" ");
  let tempLink: VaunchLink = new VaunchLink("temp", urlValue);
  if (tempLink.hasValidURL()) {
    return tempLink.execute([]);
  }

  // Failing everything else, pass the input to the default file
  // Push the first word back into commandArgs, as there is no operator
  let defaultFile: string = config.defaultFile;
  if (defaultFile) {
    commandArgs.unshift(operator);
    let file: VaunchFile | undefined = folders.getFileByPath(defaultFile);
    // If the default file is not a filepath, check if it's just the prefix
    if (!file) {
      file = folders.findQryFile(defaultFile, false);
    }
    // If a default file was found, execute it with the commandArgs, returning the response to vaunchInput
    if (file) {
      return handleResponse(file.execute(commandArgs));
    }
  }
  // If everything fails, i.e no default search, just clear the input
  sessionConfig.vaunchInput = "";
  let noCommandFoundResp: VaunchResponse = {
    type: ResponseType.Error,
    message: `Command '${operator}' not found.`,
    name: "execute",
    filetype: "VaunchSystem",
  };
  return handleResponse(noCommandFoundResp);
};

const fuzzy = (input: string) => {
  fuzzyFiles.clear();
  if (input.length > 0 && folders.findQryFile(input) == undefined) {
    // If fuzzy is enabled, search for files matching
    const folders = useFolderStore();
    let matches = folders.findFiles(input);
    fuzzyFiles.setFuzzy(matches);
    if (config.fuzzy) {
      if (matches[0]) {
        setInputIcon(matches[0].file);
      } else setInputIcon(undefined);
    }
  }
  fuzzyFiles.index = 0;
};

const updateFuzzyIndex = (increment: boolean) => {
  if (increment) {
    // If incrementing, check if index is in range
    // If not, loop back to index 0
    if (fuzzyFiles.index + 1 < fuzzyFiles.items.length) {
      fuzzyFiles.index++;
    } else fuzzyFiles.index = 0;
  } else {
    // If decrementing, check if index is in range
    // If not, loop to max index
    if (fuzzyFiles.index - 1 != -1) {
      fuzzyFiles.index--;
    } else fuzzyFiles.index = fuzzyFiles.items.length - 1;
  }
  // After updating the fuzzy index, set the input prompt icon to the selected file's icon
  // Otherwise, set it to the default
  if (fuzzyFiles.items[fuzzyFiles.index]) {
    setInputIcon(fuzzyFiles.items[fuzzyFiles.index].file);
  } else {
    setInputIcon(undefined);
  }
};

const setIconIfQuery = (input: string) => {
  // Checks if the input string matches a VaunchQuery prefix,
  // and set's the input prompts' icon to a matching file
  let file = folders.findQryFile(input);
  if (file) {
    setInputIcon(file);
  }
};

const setInputIcon = (file: VaunchFile | undefined) => {
  // Set the prefix icon in VaunchInput. If nothing is passed
  // the icon will stay the same if there are fuzzy files in case
  // VaunchInput thinks it should be reset but fuzzy matches shows otherwise
  if (file) {
    data.prefixName = file.icon;
    data.prefixClass = file.iconClass;
  } else if (fuzzyFiles.items.length == 0) {
    data.prefixName = config.prefix.name;
    data.prefixClass = config.prefix.class;
  }
};

// TODO: Implement a way to improve opening/closing of context menus.
// currently these functions are called through a series of emits from child components.
// this should be able to be re-written to use an exported function, similar to handleResponse()
const showFileOption = (
  file: VaunchUrlFile,
  folderName: string,
  xPos: number,
  yPos: number,
  action: string | null = null
) => {
  // Opens a file's context menu. Sets the target file to display options for, and set the position
  // on screen for the component
  data.optionFile = file;
  data.optionFileFolder = folderName;
  data.optionX = xPos;
  data.optionY = yPos;
  if (action) sessionConfig.action = action;
  // TODO: this could be improved, only having one context menu component which can adapt its content
  // rather than the file context menu closing all other context menu types
  sessionConfig.showFolderOptions = false;
  sessionConfig.showAppOptions = false;
  sessionConfig.showFileOptions = true;
};
const showFolderOption = (
  folder: VaunchFolder,
  xPos: number,
  yPos: number,
  action: string | null = null
) => {
  // Opens a folder's context menu, closing any other open context menu
  data.optionFolder = folder;
  data.optionX = xPos;
  data.optionY = yPos;
  if (action) sessionConfig.action = action;
  sessionConfig.showFileOptions = false;
  sessionConfig.showAppOptions = false;
  sessionConfig.showFolderOptions = true;
};
const showAppOption = (
  xPos: number,
  yPos: number,
  action: string | null = null
) => {
  // Opens the main Vaunch context menu, closing any other open context menu
  data.optionX = xPos;
  data.optionY = yPos;
  if (action) sessionConfig.action = action;
  sessionConfig.showFileOptions = false;
  sessionConfig.showFolderOptions = false;
  sessionConfig.showAppOptions = true;
};

const dragOptions = ref({
  animation: 300,
});
</script>

<style>
@import "@/assets/fontawesome/css/all.css";
@import "@/assets/base.css";

/* Set vaunch-wide colors, defaults to --color-vaunch-window */
main {
  color: v-bind("config.color.text");
}

.vaunch-window {
  border-radius: 5px;
  background: v-bind("config.color.window");
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

::selection {
  background: v-bind("config.color.highlight");
}

.vaunch-solid-bg {
  background: v-bind("config.color.windowOpaque") !important;
}

#option-buttons-container {
  width: 100vw;
}

.app-option-buttons {
  width: 100%;
  height: 2.5rem;
  border-radius: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  border-top: solid thin rgba(0, 0, 0, 0.25);
  margin-top: 1rem;
}

.option-icon {
  padding-right: 0.5em;
  width: 1.5rem;
}

.app-option {
  height: 100%;
  background: v-bind("config.color.window");
  border-left: solid thin rgba(0, 0, 0, 0.25);
  border-right: solid thin rgba(0, 0, 0, 0.25);
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
  transition: background-color 0.15s;
}

.app-option:hover {
  background: v-bind("config.color.highlight");
  cursor: pointer;
}

#main-container {
  background-position: center;
}

/* Scrollbar theming */
::-webkit-scrollbar {
  width: 3px;
}

::-webkit-scrollbar-thumb {
  background: v-bind("config.color.text");
  border-radius: 2px;
}

@-moz-document url-prefix() {
  main {
    scrollbar-color: v-bind("config.color.text") v-bind("config.color.window");
    scrollbar-width: thin;
  }
}
</style>

<template>
  <main
    id="main-container"
    :style="{ 'background-image': 'url(' + config.background + ')' }"
    @click.right.prevent="
              showAppOption($event.clientX, $event.clientY)
            "
  >
    <VaunchInput
      v-on:command="executeCommand"
      v-on:fuzzy="fuzzy"
      v-on:fuzzy-increment="updateFuzzyIndex"
      v-on:set-input-icon="setInputIcon"
      v-on:query-check="setIconIfQuery"
      :prefix-name="data.prefixName"
      :prefix-class="data.prefixClass"
      ref="vaunchInput"
    />

    <VaunchGuiResponse
      v-if="sessionConfig.showResponse"
      :response="sessionConfig.currentResponse"
    />

    <VaunchFuzzy
      v-if="fuzzyFiles.items.length > 0 && config.fuzzy"
      :fuzzy-matches="fuzzyFiles.items as FuzzyEntry[]"
      :current-index="fuzzyFiles.index"
    />
    <div v-if="config.showGUI" id="bottom-half">
      <div id="commands-folders-container">
        <div v-if="config.showCommands" id="commands-container">
          <VaunchGuiCommands />
        </div>
        <TransitionGroup>
          <draggable
            id="vaunch-folder-container"
            v-model="folderList"
            delay="200"
            :delayOnTouchOnly="true"
            v-bind="dragOptions"
            item-key="name"
          >
          <template #item="{element: folder}">
            <VaunchGuiFolder
              :key="folder.name"
              v-on:show-file-option="showFileOption"
              v-on:show-folder-option="showFolderOption"
              :folder="folder"
            />
          </template>
          </draggable>
        </TransitionGroup>

      </div>
      <div class="mobile-only" id="option-buttons-container">
        <div class="app-option-buttons">
          <div class="app-option" @click="showAppOption(0, 0, 'edit')">
            <span
              ><i class="fa-solid fa-pencil option-icon" />Vaunch Settings</span
            >
          </div>
          <div class="app-option" @click="showAppOption(0, 0, 'add')">
            <span><i class="fa-solid fa-plus option-icon" />Add Folder</span>
          </div>
        </div>
      </div>
    </div>

    <VaunchMan v-if="sessionConfig.showHelp" :commands="commands" />

    <!-- Context menu components are at the app root to ensure there will be only one open at any one time -->
    <VaunchFileOption
      v-if="sessionConfig.showFileOptions"
      :file="data.optionFile as VaunchUrlFile"
      :folder-name="data.optionFileFolder"
      :x-pos="data.optionX"
      :y-pos="data.optionY"
    />
    <VaunchFolderOption
      ref="folderOption"
      v-if="sessionConfig.showFolderOptions"
      :folder="data.optionFolder"
      :x-pos="data.optionX"
      :y-pos="data.optionY"
    />
    <VaunchAppOption
      v-if="sessionConfig.showAppOptions"
      :x-pos="data.optionX"
      :y-pos="data.optionY"
    />
  </main>
</template>
