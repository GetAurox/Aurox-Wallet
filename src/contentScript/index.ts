import "common/bootstrap";

import "./inject";

import { setupSW5MinuteDeathmarkWorkaroundForContentScript } from "common/chrome/workarounds/sw5MinuteDeathmark/contentScript";

import { setMessageSender, DOMActions } from "common/dom";

import { DApp } from "common/operations";

import { PermissionService, WalletService } from "./services";

setMessageSender("content-script", chrome.runtime.id);

let ready = false;

DOMActions.ContentScriptReady.registerResponder(async () => {
  // Alert service worker that the page has loaded
  await DApp.InternalRPCRequest.perform({ method: "aurox_initialize", documentTitle: document.title });

  return { ready };
});

export async function configureRPCProxy() {
  await Promise.all([await new WalletService().initialize(), await new PermissionService().initialize()]);

  DOMActions.SendRPCRequest.registerResponder(async request => {
    return await DApp.InternalRPCRequest.perform({
      method: request.method,
      params: request.params as unknown[],
      documentTitle: document.title,
    });
  });

  ready = true;

  setupSW5MinuteDeathmarkWorkaroundForContentScript();
}

configureRPCProxy();
