declare module "*.svg" {
  import { SVGFactory } from "react";

  export const ReactComponent: SVGFactory;

  export default ReactComponent;
}

declare module "raw-loader!*" {
  export const content: string;

  export default content;
}

declare namespace chrome.action {
  export interface UserSettings {
    isOnToolbar: boolean;
  }

  export function getUserSettings(): Promise<UserSettings>;
}
