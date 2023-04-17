import type { VaunchFile } from "@/models/VaunchFile";
import { defineStore } from "pinia";

export const useFuzzyStore = defineStore("fuzzy", {
  // Store to hold currently matched files from the fuzzy finder
  state: () => {
    return {
      items: [] as Array<{'file':VaunchFile, 'folder':string}>,
      index: 0,
    };
  },
  actions: {
    // Sets the list of found files
    setFuzzy(files: Array<{'file':VaunchFile, 'folder':string}>) {
      this.items = files;
    },
    // Clears the list of found files
    clear() {
      this.items = [];
      this.index = 0;
    },
  },
});
