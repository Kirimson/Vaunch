import { defineStore, type StoreDefinition } from "pinia";
import { useStorage } from "@vueuse/core";

import { VaunchFolder } from "@/models/VaunchFolder";
import type { VaunchFile } from "@/models/VaunchFile";

export const useFolderStore: StoreDefinition = defineStore({
  id: "folder",
  state: () => ({
    rawFolders: useStorage(
      "folders",
      new Array<VaunchFolder>(),
      undefined,
      {
        // Pinia was unable to read/write folders and their files successfully
        // potentially due trying to store a complex class. Using a custom
        // serialiser to convert folders to a JSON representation that can be
        // stored within localstorage
        serializer: {
          read(v: string) {
            // Parse the read JSON from localstorage
            const rawData = JSON.parse(v);
            // Create a new map to return, matching the type of rawFolders
            const arr = new Array<VaunchFolder>();
            for (const folder of rawData) {
              // Parse each JSON representation as a VaunchFolder, and add it to the map
              // using the folder name as the map key
              const vaunchFolder = VaunchFolder.parse(folder);
              arr.push(vaunchFolder);
            }
            return arr;
          },
          write(v: Array<VaunchFolder>) {
            // Convert all folders into a JSON compatible format and return the JSON string to store
            const storeData: any[] = [];
            for (const folder of v) {
              // VaunchFolder.info() returns a JS Object representing the folder and its files
              storeData.push(folder.info());
            }
            return JSON.stringify(storeData);
          },
        },
      }
    ),
  })
  ,
  getters: {
    // Returns a simple array of all folders, without map keys
    items: (state: { rawFolders: Array<VaunchFolder> }):VaunchFolder[] => state.rawFolders,
    // Returns all names of folders
    folderNames: (state: { rawFolders: Array<VaunchFolder> }) =>
      state.rawFolders.map(folder => folder.name),
    // Returns a VaunchFolder given a folder name
    getFolderByName: (state: { rawFolders: Array<VaunchFolder> }) => {
      return (folderName: string) => state.rawFolders.find(folder => folder.name == folderName);
    },
    // Gets a file within a folder, given a filepath, e.g example/site.lnk
    getFileByPath: (state: { rawFolders: Array<VaunchFolder> }) => {
      return (path: string) =>
        (state.rawFolders.find(folder => folder.name == path.split("/")[0]))?.getFile(
          path.split("/")[1]
        );
    },
  },
  actions: {
    // Adds a new folder to the folder store
    add(name: string) {
      const newFolder = new VaunchFolder(name);
      this.rawFolders.push(newFolder);
    },
    // Replaces the current list of folders, ideally only used when re-ordering folders
    setFolders(folders: VaunchFolder[]) {
      const newArr = new Array<VaunchFolder>();
      folders.forEach(folder => {
        newArr.push(folder)
      });
      this.rawFolders = newArr;
    },
    insert(folder: VaunchFolder) {
      this.rawFolders.push(folder);
    },
    remove(toDelete: string) {
      const folderToDelete = this.rawFolders.filter(folder => folder.name == toDelete)
      if (folderToDelete.length > 0) {
        folderToDelete.forEach(file => this.rawFolders.splice(this.rawFolders.findIndex(n => n === file), 1))
        return true
      }
      return false
    },
    removeAll() {
      this.rawFolders = new Array<VaunchFolder>();
    },
    findFiles(search: string, types: string[] = []) {
      const matchingFiles: Array<{'file':VaunchFile, 'folder':string}> = new Array<{'file':VaunchFile, 'folder':string}>();
      for (const folder of this.rawFolders.values()) {
        const matches = folder.searchFile(search, types)
        matches.forEach(match => matchingFiles.push({'file':match, 'folder': folder.name}))
      }
      return matchingFiles;
    },
    findPosition(folderName: string) {
      return this.rawFolders.findIndex(folder => folder.name == folderName)
    }
  },
});
