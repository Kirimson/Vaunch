import { VaunchCommand } from "@/models/VaunchCommand";
import type { VaunchFile } from "@/models/VaunchFile";
import type { VaunchFolder } from "@/models/VaunchFolder";
import { VaunchLink } from "@/models/VaunchLink";
import type { Parameter, Example } from "@/models/VaunchManual";
import { VaunchQuery } from "@/models/VaunchQuery";
import { useFolderStore } from "@/stores/folder";

export class VaunchTouch extends VaunchCommand {
  constructor() {
    let longDescription:string[] = [`Creates new file(s) within a folder. A file will only be created in the folder name exists,
    and a file does not already exist with the provided name. Two types of files can be made: Link files (.lnk) and Query files (.qry)`, 
    `Link files redirect to the page within the file's content. Query files allow additional arguments to be passed when running,
    to search using that URL, or navigate to a defined page, by replacing '\${}' within the file's content with the provided arguments.`,
    `Query files can be ran either by typing the full filepath, or using a defined shortened prefix, followed by a colon.`,
    `If no file extension is specified when running this command, a link file will be created by default.`]
    let parameters:Parameter[] = [{
      name:"filepath",
      optional: false,
      repeatable: false,
    },
    {
      name:"prefix",
      optional: true,
      repeatable: false,
    },
    {
      name:"content",
      optional: false,
      repeatable: false,
    }]
    let examples:Example[] = [{
      args: ["sites/example", "example.com"],
      description: ["Creates a Link file within the 'sites' folder. The file will navigate to https://example.com"],
    },
    {
      args: ["sites/example.qry", "ex", "example.com/search?q=${}"],
      description: ["Creates a Query file within the 'sites' folder",
      "Can be executed with: 'sites/example.qry foo', or 'ex: foo'"],
    }]
    super("touch", longDescription, parameters, examples);
  }
  aliases: string[] = ["make-file"];
  description: string = "Creates new files";

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