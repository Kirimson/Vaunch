import type { VaunchFolder } from "@/models/VaunchFolder";

export function exportVaunch(folders: VaunchFolder[], config: any): string {
  const vaunchData = {
    folders: [] as any[],
    config: {},
  };

  if (config) {
    vaunchData["config"] = {
      background: config.background,
      showGUI: config.showGUI,
      titleCase: config.titleCase,
      defaultFile: config.defaultFile,
      fuzzy: config.fuzzy,
      showCommands: config.showCommands,
      prefix: {
        class: config.prefix.class,
        name: config.prefix.name,
      },
      color: {
        window: config.color.window,
        windowOpaque: config.color.windowOpaque,
        text: config.color.text,
        autocomplete: config.color.autocomplete,
        highlight: config.color.highlight,
      },
    };
  }

  for (const folder of folders) {
    vaunchData.folders.push(folder.info());
  }
  return JSON.stringify(vaunchData, undefined, 2);
}

export function readImportFile(file: Blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      if (fr.result) {
        const importObject = JSON.parse(fr.result.toString());
        resolve(importObject);
      }
    };
    fr.onerror = reject;
    fr.readAsText(file);
  });
}
