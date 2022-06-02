import { VaunchFile } from "./VaunchFile";
import { VaunchLink } from "./VaunchLink";
import { VaunchQuery } from "./VaunchQuery";

export class VaunchFolder {
  name: string;
  files: Map<string, VaunchFile>
  icon:string;
  iconClass:string;

  constructor(name: string, icon:string="folder", iconClass:string="solid") {
    this.name = name;
    this.files = new Map<string, VaunchFile>();
    this.icon = icon
    this.iconClass = iconClass
  }

  public addFile(newFile:VaunchFile): void {
    if (this.getFile(newFile.fileName)) return;
    this.files.set(newFile.fileName, newFile);
  }

  titleCase(): string {
    let prettyString = this.name.replace(/[-_]/g, ' ');
    return prettyString.toLowerCase().split(' ').map(function(word) {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }

  getFile(fileName:string): VaunchFile|undefined {
    let file = this.files.get(fileName)
    if (file instanceof VaunchFile) {
      return file;
    }
    return undefined;
  }

  getFiles(): VaunchFile[] {
    return Array.from(this.files.values())
  }

  searchFile(search:string, types:string[]=[]): VaunchFile[] {
    let matches:VaunchFile[] = [];
    for (const [fileName, file] of this.files.entries()) {
      if (fileName.includes(search)) {
        if (types.includes(file.filetype)) {
          matches.push(file)
        } else if (types.length == 0) {
          matches.push(file)
        }
      } else if (file.namesStartWith(search)) {
        if (types.includes(file.filetype)) {
          matches.push(file)
        } else if (types.length == 0) {
          matches.push(file)
        }
      }
    }
    return matches;
  }

  removeFile(toDelete:string): boolean {
    return this.files.delete(toDelete)
  }

  setIcon(icon:string, iconClass:string):void {
    this.icon = icon
    this.iconClass = iconClass
  }

  info(): any {
    let fileInfo:any[] = [];
    this.getFiles().forEach((file) => fileInfo.push(file.info()))
    let data = {
      name: this.name,
      icon: this.icon,
      iconClass: this.iconClass,
      files: fileInfo
    }
    return data
  }

  // Parse a VaunchFolder from serialized JSON data
  // Also creates VaunchFiles that belong to the folder
  static parse(data:any): VaunchFolder {
    let folder = new VaunchFolder(data.name, data.icon, data.iconClass);
    for (let fileData of data.files) {
      let file: VaunchFile|undefined = undefined;
      if (fileData.type == "VaunchLink") {
        file = new VaunchLink(fileData.fileName, fileData.content, folder,
          fileData.icon, fileData.iconClass, fileData.hits, fileData.description);
      } else if (fileData.type == "VaunchQuery") {
        file = new VaunchQuery(fileData.fileName, fileData.prefix, fileData.content, folder,
          fileData.icon, fileData.iconClass, fileData.hits, fileData.description);
      }
      if (file != undefined) folder.addFile(file)
    }
    return folder;
  }
}