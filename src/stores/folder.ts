import { defineStore, type StoreDefinition } from "pinia";
import { useStorage } from "@vueuse/core";

import { VaunchFolder } from "@/models/VaunchFolder";
import type { VaunchFile } from "@/models/VaunchFile";

export const useFolderStore: StoreDefinition = defineStore({
  id: "folder",
  state: () => ({
    rawFolders: useStorage(
      "folders",
      new Map<string, VaunchFolder>(),
      undefined,
      {
        // Pinia was unable to read/write folders and their files successfully
        // potentially due trying to store a complex class. Using a custom
        // serialiser to convert folders to a JSON representation that can be
        // stored within localstorage
        serializer: {
          read(v: any) {
            // Parse the read JSON from localstorage
            const rawData = JSON.parse(v);
            // Create a new map to return, matching the type of rawFolders
            const map = new Map<string, VaunchFolder>();
            for (const folder of rawData) {
              // Parse each JSON representation as a VaunchFolder, and add it to the map
              // using the folder name as the map key
              const vaunchFolder = VaunchFolder.parse(folder);
              map.set(vaunchFolder.name, vaunchFolder);
            }
            return map;
          },
          write(v: Map<string, VaunchFolder>) {
            // Convert all folders into a JSON compatible format and return the JSON string to store
            const storeData: any[] = [];
            for (const folder of v) {
              // VaunchFolder.info() returns a JS Object representing the folder and its files
              storeData.push(folder[1].info());
            }
            return JSON.stringify(storeData);
          },
        },
      }
    ),
  }),
  getters: {
    // Returns a simple array of all folders, without map keys
    items: (state: { rawFolders: any }) =>
      Array.from(state.rawFolders.values()),
    // Returns all names of folders
    folderNames: (state: { rawFolders: Map<string, VaunchFolder> }) =>
      Array.from(state.rawFolders.keys()),
    // Returns a VaunchFolder given a folder name
    getFolderByName: (state: { rawFolders: any }) => {
      return (folderName: string) => state.rawFolders.get(folderName);
    },
    // Gets a file within a folder, given a filepath, e.g example/site.lnk
    getFileByPath: (state: { rawFolders: any }) => {
      return (path: string) =>
        (state.rawFolders.get(path.split("/")[0]) as VaunchFolder)?.getFile(
          path.split("/")[1]
        );
    },
  },
  actions: {
    // Adds a new folder to the folder store
    add(name: string) {
      // Get the next logical position for this folder to set its position
      const nextPos: number = this.rawFolders.size + 1;
      const newFolder = new VaunchFolder(name);
      newFolder.position = nextPos;
      this.rawFolders.set(name, newFolder);
    },
    // Replaces the current list of folders, ideally only used when re-ordering folders
    setFolders(folders: VaunchFolder[]) {
      const newMap = new Map<string, VaunchFolder>();
      folders.forEach(folder => {
        newMap.set(folder.name, folder)
      });
      this.rawFolders = newMap;
    },
    insert(folder: VaunchFolder) {
      this.rawFolders.set(folder.name, folder);
    },
    remove(toDelete: string) {
      this.rawFolders.delete(toDelete);
    },
    removeAll() {
      this.rawFolders = new Map<string, VaunchFolder>();
    },
    findFiles(search: string, types: string[] = []) {
      const matchingFiles: VaunchFile[] = [];
      for (const folder of this.rawFolders.values()) {
        matchingFiles.push(...folder.searchFile(search, types));
      }
      return matchingFiles;
    },
  },
});
