import { useFolderStore } from "@/stores/folder";
import { VaunchCommand } from "./VaunchCommand";
import type { VaunchFile } from "./VaunchFile";
import type { VaunchFolder } from "./VaunchFolder";
import { VaunchLink } from "./VaunchLink";
import { VaunchQuery } from "./VaunchQuery";

export class VaunchMkdir extends VaunchCommand {
  constructor() {
    super("mkdir");
  }

  aliases: string[] = ["make-folder"];

  execute(args:string[]): void {
    const folder = useFolderStore();
    args.forEach((newFolder) => {
      if (newFolder.length > 0 && !folder.folderNames.includes(newFolder)){
        folder.add(newFolder);
      }
    })
  }
}

export class VaunchTouch extends VaunchCommand {
  constructor() {
    super("touch");
  }
  aliases: string[] = ["make-file"];

  execute(args:string[]): void {
    const folders = useFolderStore();
    let newFileName:string = args[0];

    let filePath = newFileName.split('/');
    let folderName:string = filePath[0];
    let fileName:string = filePath[1];

    let folder:VaunchFolder = folders.getFolderByName(folderName);
    if (folder) {
      let newFile:VaunchFile|undefined;
      let iconName:string|undefined;
      let iconClass:string|undefined;

      if (fileName.endsWith('.qry')) {
        let filePrefix:string = args[1];
        let fileContent:string = args[2];
        if (filePrefix && fileContent) {
          newFile = new VaunchQuery(fileName, filePrefix, fileContent, folder);
          // Icon name/class is the fourth/fith arg provided for VaunchLink
          iconName = args[3];
          iconClass = args[4];
        }
      } else {
        let fileContent:string = args[1];
        newFile = new VaunchLink(fileName, fileContent, folder);
        // Icon name/class is the third/fourth arg provided for VaunchLink
        iconName = args[2];
        iconClass = args[3];
      }
      
      if (newFile) {
        // Set the file icon if a custom icon was provided
        if (iconName) newFile.setIcon(iconName, iconClass);
        folder.addFile(newFile);
      }
    }
  }
}

export class VaunchEditFile extends VaunchCommand {
  constructor() {
    super("edit");
  }

  aliases: string[] = ["edit-file"];

  execute(args:string[]): void {
    const folders = useFolderStore();
    let fullPath:string = args[0];
    // Remove the first arg, the filepath
    args.shift()

    let filePath = fullPath.split('/');
    let folderName:string = filePath[0];
    let fileName:string = filePath[1];
    let folder:VaunchFolder = folders.getFolderByName(folderName);

    let file = folder.getFile(fileName);
    if (file) {
      // Send remaining args to the file to edit
      file.edit(args)
    }
  }
}

export class VaunchSetIcon extends VaunchCommand {
  constructor() {
    super("set-icon");
  }

  execute(args:string[]): void {
    const folders = useFolderStore();
    let fullPath:string = args[0];
    let newIcon:string = args[1]
    let newIconclass:string = args[2]
    let splitPath = fullPath.split('/');

    let folderName:string = splitPath[0];
    let fileName:string = splitPath[1];
    let folder:VaunchFolder = folders.getFolderByName(folderName);

    if (folder && fileName) {
      let file = folder.getFile(fileName);
      if (file) {
        file.setIcon(newIcon, newIconclass);
        window.location.reload();
      }
    } else if (folder) {
      // Assume we're attempting to set the folder's icon
      folder.setIcon(newIcon, newIconclass);
      window.location.reload();
    }
  }
}

export class VaunchRmdir extends VaunchCommand {
  constructor() {
    super("rmdir");
  }

  aliases: string[] = ["remove-folder", "delete-folder"];

  execute(args:string[]): void {
    const folders = useFolderStore();
    args.forEach(toDelete => {
      // Strip slashes from foldernames, if running from autocompleted value
      toDelete = toDelete.replace("/","");
      folders.remove(toDelete);
    })
  }
}

export class VaunchRm extends VaunchCommand {
  constructor() {
    super("rm");
  }
  aliases: string[] = ["remove-file", "delete-file"];

  execute(args:string[]): void {
    const folders = useFolderStore();
    let fullPath:string = args[0];

    let filePath = fullPath.split('/');
    let folderName:string = filePath[0];
    let fileToDelete:string = filePath[1];
    let folder:VaunchFolder = folders.getFolderByName(folderName);
    folder.removeFile(fileToDelete)
  }
}