import { VaunchFile } from "./VaunchFile";
import { VaunchLink } from "./VaunchLink";
import { VaunchQuery } from "./VaunchQuery";

export class VaunchFolder {
  name: string;
  files: VaunchFile[];
  icon: string;
  iconClass: string;

  constructor(
    name: string,
    icon = "folder",
    iconClass = "solid",
  ) {
    this.name = name;
    this.files = [];
    this.icon = icon;
    this.iconClass = iconClass;
  }

  public addFile(newFile: VaunchFile): boolean {
    if (this.getFile(newFile.fileName)) return false;
    this.files.push(newFile);
    return true;
  }

  getIdSafeName(): string {
    return this.name.replace(".", "-");
  }

  titleCase(): string {
    const prettyString = this.name.replace(/[-_]/g, " ");
    return prettyString
      .toLowerCase()
      .split(" ")
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  getFile(fileName: string): VaunchFile | undefined {
    const file = this.files.find(file => file.fileName == fileName);
    if (file instanceof VaunchFile) {
      return file;
    }
    return undefined;
  }

  getFiles(): VaunchFile[] {
    return Array.from(this.files.values());
  }

  setFiles(newFiles:VaunchFile[]) {
    this.files = newFiles
  }

  removeFile(toDelete: string):boolean {
    const fileToDelete = this.files.filter((file) => file.fileName == toDelete)
    if (fileToDelete.length > 0) {
      fileToDelete.forEach(file => this.files.splice(this.files.findIndex(n => n === file), 1))
      return true
    }
    return false
  }

  setIcon(icon: string, iconClass: string): void {
    this.icon = icon;
    this.iconClass = iconClass;
  }

  findFilePosition(fileName: string):number {
    return this.files.findIndex(files => files.fileName == fileName)
  }

  info(): any {
    const fileInfo: any[] = [];
    this.getFiles().forEach((file) => fileInfo.push(file.info()));
    const data = {
      name: this.name,
      icon: this.icon,
      iconClass: this.iconClass,
      files: fileInfo,
    };
    return data;
  }

  // Parse a VaunchFolder from serialized JSON data
  // Also creates VaunchFiles that belong to the folder
  static parse(data: any): VaunchFolder {
    const folder = new VaunchFolder(
      data.name,
      data.icon,
      data.iconClass,
    );
    for (const fileData of data.files) {
      let file: VaunchFile | undefined = undefined;
      if (fileData.type == "VaunchLink") {
        file = new VaunchLink(
          fileData.fileName,
          fileData.content,
          folder,
          fileData.icon,
          fileData.iconClass,
          fileData.hits,
          fileData.description
        );
      } else if (fileData.type == "VaunchQuery") {
        file = new VaunchQuery(
          fileData.fileName,
          fileData.prefix,
          fileData.content,
          folder,
          fileData.icon,
          fileData.iconClass,
          fileData.hits,
          fileData.description
        );
      }
      if (file != undefined) folder.addFile(file);
    }
    return folder;
  }
}
