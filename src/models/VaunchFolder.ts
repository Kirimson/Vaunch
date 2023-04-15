import type { VaunchFile } from "./VaunchFile";
import { VaunchLink } from "./VaunchLink";
import { VaunchQuery } from "./VaunchQuery";
import { VaunchUrlFile } from "./VaunchUrlFile";

export class VaunchFolder {
  name: string;
  files: VaunchFile[];
  icon: string;
  iconClass: string;
  position: number;

  constructor(
    name: string,
    icon = "folder",
    iconClass = "solid",
    position = -1
  ) {
    this.name = name;
    this.files = [];
    this.icon = icon;
    this.iconClass = iconClass;
    this.position = position;
  }

  public addFile(newFile: VaunchFile): boolean {
    if (this.getFile(newFile.fileName)) return false;
    // Set the new file's position to last
    const nextPos: number = this.getFiles().length + 1;
    newFile.position = nextPos;
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

  getFile(fileName: string): VaunchUrlFile | undefined {
    const file = this.files.find((file) => {file.fileName == fileName});
    if (file instanceof VaunchUrlFile) {
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

  searchFile(search: string, types: string[] = []): VaunchFile[] {
    const matches: VaunchFile[] = [];
    for (const file of this.files) {
      if (file.fileName.includes(search)) {
        if (types.includes(file.filetype)) {
          matches.push(file);
        } else if (types.length == 0) {
          matches.push(file);
        }
      } else if (file.namesStartWith(search)) {
        if (types.includes(file.filetype)) {
          matches.push(file);
        } else if (types.length == 0) {
          matches.push(file);
        }
      }
    }
    return matches;
  }

  removeFile(toDelete: string) {
    const fileToDelete = this.files.filter((file) => file.fileName == toDelete)
    fileToDelete.forEach(file => this.files.splice(this.files.findIndex(n => n === file), 1))
  }

  setIcon(icon: string, iconClass: string): void {
    this.icon = icon;
    this.iconClass = iconClass;
  }

  info(): any {
    const fileInfo: any[] = [];
    this.getFiles().forEach((file) => fileInfo.push(file.info()));
    const data = {
      name: this.name,
      icon: this.icon,
      iconClass: this.iconClass,
      files: fileInfo,
      position: this.position,
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
      data.position
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
          fileData.description,
          fileData.position
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
          fileData.description,
          fileData.position
        );
      }
      if (file != undefined) folder.addFile(file);
    }
    return folder;
  }
}
