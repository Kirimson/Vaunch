import { VaunchCommand } from "@/models/VaunchCommand";
import type { VaunchFolder } from "@/models/VaunchFolder";
import type { Parameter, Example } from "@/models/VaunchManual";
import type { VaunchQuery } from "@/models/VaunchQuery";
import { ResponseType, type VaunchResponse } from "@/models/VaunchResponse";
import { useFolderStore } from "@/stores/folder";

export class VaunchSed extends VaunchCommand {
  constructor() {
    const longDescription: string[] = [
      "Modifies how a Query File's search entry is processed by replacing text using a regex-like expression.",
      "Handy if the some copy-pasted text needs to be predictably edited to be valid for the target URL.",
      "The matched string can be have all occurrences replaced, or only the first replaced by adding the g flag to the expression.",
      "If replaceString is not supplied, all instances of 'matchString' will be removed (replaced with a blank string)",
      "The target file must be a Query File."
    ];
    const parameters: Parameter[] = [
      {
        name: "filepath",
        optional: false,
        repeatable: false,
      },
      {
        name: "expression",
        optional: true,
        repeatable: false,
      },
      {
        name: "replaceString",
        optional: true,
        repeatable: false,
      },
    ];
    const examples: Example[] = [
      {
        args: ["terraform/azurerm_resource.qry", "/azurerm_/"],
        description: [
          "Replaces the term 'azurerm_' with a blank string. E.g: 'azurerm_resource_group' becomes 'resource_group'",
        ],
      },
      {
        args: ["sites/example.qry", "/ /g", "/"],
        description: [
          "Replaces all spaces with a forward slash.",
        ],
      },
    ];
    super("sed", longDescription, parameters, examples);
  }
  description = "Changes the sed expression of an existing Query File";

  execute(args: string[]): VaunchResponse {
    const folders = useFolderStore();
    const fullPath: string = args[0];
    const expression: string = args[1];
    const replaceString: string = args[2];
    const splitPath = fullPath.split("/");

    const folderName: string = splitPath[0];
    const fileName: string = splitPath[1];
    const folder: VaunchFolder = folders.getFolderByName(folderName);

    if (folder && fileName) {
      const file = folder.getFile(fileName);
      if (!file) return this.makeResponse(
        ResponseType.Error,
        `The file ${fullPath} does not exist`
      );
      if (file?.filetype == "VaunchQuery") {
        const qryFile = file as VaunchQuery;
        qryFile.sed = [expression, replaceString];
        return this.makeResponse(
          ResponseType.Success,
          `Successfully set the sed expression for ${fullPath}`
        );
      } else {
        return this.makeResponse(
          ResponseType.Error,
          `The file at ${fullPath} is not a Query File`
        );
      }
    }
    return this.makeResponse(
      ResponseType.Error,
      `Something went wrong`
    );
  }
}
