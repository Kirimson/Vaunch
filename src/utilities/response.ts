import { type VaunchResponse, ResponseType } from "@/models/VaunchResponse";
import { useSessionStore } from "@/stores/sessionState";

export function handleResponse(response: VaunchResponse) {
  const sessionConfig = useSessionStore();
  let newInputValue = "";

  switch (response.type) {
    case ResponseType.Error:
    case ResponseType.Info:
      sessionConfig.showResponse = true;
      break;
    case ResponseType.UpdateInput:
      newInputValue = response.message;
      sessionConfig.showResponse = false;
      break;
    default:
      sessionConfig.showResponse = false;
  }

  sessionConfig.currentResponse = response;
  const newInput: string = newInputValue ? newInputValue : "";
  sessionConfig.vaunchInput = newInput;
}
