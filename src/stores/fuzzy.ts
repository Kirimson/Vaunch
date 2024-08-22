import type { VaunchUrlFile } from "@/models/VaunchUrlFile";
import { defineStore } from "pinia";

export type FuzzyEntry = {
  file: VaunchUrlFile;
  folder: string;
};

export const useFuzzyStore = defineStore("fuzzy", {
  // Store to hold currently matched files from the fuzzy finder
  state: () => {
    return {
      items: new Array<FuzzyEntry>(),
      index: 0,
    };
  },
  actions: {
    // Sets the list of found files
    setFuzzy(files: Array<FuzzyEntry>) {
      this.items = files;
    },
    // Clears the list of found files
    clear() {
      this.items = [];
      this.index = 0;
    },
  },
});
