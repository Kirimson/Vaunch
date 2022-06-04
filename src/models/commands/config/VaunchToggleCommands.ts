import { VaunchCommand } from "@/models/VaunchCommand";
import type { Example } from "@/models/VaunchManual";
import { useConfigStore } from "@/stores/config";

export class VaunchToggleCommands extends VaunchCommand {
  hasArgs: boolean = false;
  constructor() {
    let longDescription:string[] = [`Toggles if the command window is shows. The command window lists all available commands, and
      contains input boxes to execute the command. Commands without any parameters can just be clicked to be executed.`, 
      `If the GUI has been toggled off, this command will have no visible effect until the GUI is toggled back on.`]
   let examples:Example[] = [{
     args: [],
     description: ["Toggles if the command window is shown"]
   }]
    super("toggle-commands", longDescription, [], examples);
  }
  description: string = "Toggles if the commands window is visible"

  execute(args: string[]): void {
    const config = useConfigStore();
    config.showCommands = !config.showCommands;
  }
}