import { VaunchCommand } from "@/models/VaunchCommand";
import type { VaunchFile } from "@/models/VaunchFile";
import type { VaunchFolder } from "@/models/VaunchFolder";
import type { Parameter, Example } from "@/models/VaunchManual";
import { useFolderStore } from "@/stores/folder";

export class VaunchSetDescription extends VaunchCommand {
  constructor() {
    let longDescription:string[] = ["Sets the description for a file. Descriptions are displayed as a tooltip when hovering over the file's entry.",
      "The file extension must be supplied to set the file's description."]
    let parameters:Parameter[] = [{
      name: "filename",
      optional:false,
      repeatable:false
    },
    {
      name:"description",
      optional:false,
      repeatable:false
    }]
    let examples:Example[] = [{
      args:["sites/example.lnk", "Goes to an example site"],
      description: ["Changes the description of the file 'example.lnk' within the 'sites' folder"]
    }]
    super("set-description", longDescription, parameters, examples);
  }
  aliases: string[] = ["set-desc"];
  description: string = "Sets the description of a file's tooltip";

  execute(args:string[]): void {
    const folders = useFolderStore();
    let fullPath:string|undefined = args.shift();
    if (fullPath) {
      let filePath = fullPath.split('/');
      let folderName:string = filePath[0];
      let fileName:string = filePath[1];
      let folder:VaunchFolder = folders.getFolderByName(folderName);
      if (folder) {
        let file:VaunchFile|undefined = folder.getFile(fileName);
        if (file) file.description = args.join(' ');
      }
    }
  }
}