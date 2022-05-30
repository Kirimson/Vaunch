import { defineStore, type StoreDefinition } from "pinia";
import defaultBg from "@/assets/img/default.png";
import { useStorage } from '@vueuse/core'

export const defaultconfig = {
  background: defaultBg,
  showGUI: true,
  titleCase: true,
  defaultFile: "",
  fuzzy: false,
  showCommands: false,
  prefix: {
    class: "solid",
    name: "chevron-right",
  },
  color: {
    window: 'var(--color-vaunch-window)',
    text: 'var(--color-vaunch-text)',
    autocomplete: 'var(--color-autocomplete)',
    highlight: 'var(--color-highlight)',
  }
}

export const useConfigStore: StoreDefinition = defineStore({
  id: "config",
  state: () => useStorage('config', defaultconfig,
    undefined,
    {
      serializer: {
        read(v: any) {
          let data = JSON.parse(v);
          let config = {
            background: data.background ? data.background : defaultconfig.background,
            showGUI: data.showGUI != undefined ? data.showGUI : defaultconfig.showGUI,
            titleCase: data.titleCase != undefined ? data.titleCase : defaultconfig.titleCase,
            defaultFile: data.defaultFile ? data.defaultFile : defaultconfig.defaultFile,
            fuzzy: data.fuzzy != undefined ? data.fuzzy : defaultconfig.fuzzy,
            showCommands: data.showCommands != undefined ? data.showCommands : defaultconfig.showCommands,
            prefix: data.prefix ? data.prefix : defaultconfig.prefix,
            color: data.color ? data.color : defaultconfig.color
          }
          return config;
        },
        write: (v: any) => JSON.stringify(v),
      },
    },
  ),
  getters: {
    currentConfig: (state:any) => state
  },
  actions: {
    newConfig(newConfig:any) {
      this.background = newConfig.background;
      this.showGUI = newConfig.showGUI;
      this.titleCase = newConfig.titleCase;
      this.defaultFile = newConfig.defaultFile;
      this.fuzzy = newConfig.fuzzy;
      this.showCommands = newConfig.showCommands;
      this.prefix = newConfig.prefix;
      this.color = newConfig.color;
    }
  }
});
