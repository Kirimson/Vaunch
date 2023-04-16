import { VaunchCommand } from "@/models/VaunchCommand";
import type { VaunchFolder } from "@/models/VaunchFolder";
import type { Parameter, Example } from "@/models/VaunchManual";
import { ResponseType, type VaunchResponse } from "@/models/VaunchResponse";
import { useFolderStore } from "@/stores/folder";

export class VaunchSetPosition extends VaunchCommand {
  constructor() {
    const longDescription: string[] = [
      "Change the position of a file or folder."
    ];
    const parameters: Parameter[] = [
      {
        name: "filepath",
        optional: false,
        repeatable: false,
      },
      {
        name: "position",
        optional: false,
        repeatable: false,
      }
    ];
    const examples: Example[] = [
      {
        args: ["sites/example.lnk", "1"],
        description: [
          "Sets the position for the file 'sites/example.lnk' to 1, the first position",
        ],
      },
      {
        args: ["sites/example.qry", "2"],
        description: [
          "Sets the position for the file  'sites/example.qry'to 2, the second position",
        ],
      }
    ];
    super("set-position", longDescription, parameters, examples);
  }
  description = "Changes the icon of an existing file/folder";

  execute(args: string[]): VaunchResponse {
    const folders = useFolderStore();
    const fullPath: string = args[0];
    let newPos = Number(args[1]);
    const splitPath = fullPath.split("/");

    const folderName: string = splitPath[0];
    const fileName: string = splitPath[1];
    const folder: VaunchFolder = folders.getFolderByName(folderName);

    // If a folder exists and a file was given we're adjusting a file position
    if (folder && fileName) {
      const file = folder.getFile(fileName);
      if (file) {

        // Get the index of the file
        const index = folder.files.findIndex(file => file.fileName == fileName)
        // Check if the new position is a valid index, else set to last
        if (newPos-1 > folder.files.length) newPos = folder.files.length
        // Splice the file out, then back in at the wanted index
        // Minus one to convert human positioning (1 = first) to computer
        // positioning (0 = first)
        folder.files.splice(index,1)
        folder.files.splice(newPos-1,0,file)

        return this.makeResponse(
          ResponseType.Success,
          `Changed the position of ${fullPath}`
        );
      } else {
        return this.makeResponse(
          ResponseType.Error,
          `The file ${fullPath} does not exist`
        );
      }
    } else if (folder) {
      // No file was given, moving the folder position

      // Get the index of the folder
      const index = folders.items.findIndex((folder:VaunchFolder) => folder.name == folderName)
      // Check if the new position is a valid index, else set to last
      if (newPos-1 > folders.items.length) newPos = folders.items.length
      // Splice the file out, then back in at the wanted index
      // Minus one to convert human positioning (1 = first) to computer
      // positioning (0 = first)
      folders.items.splice(index,1)
      folders.items.splice(newPos-1,0,folder)
      
    } else {
      return this.makeResponse(
        ResponseType.Error,
        `The folder ${folderName} does not exist`
      );
    }
    return this.makeResponse(
      ResponseType.Success,
      `Changed the position of ${fullPath}`
    );
  }
}
