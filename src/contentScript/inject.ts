import { INJECT_SCRIPT_URL } from "common/entities";

import umbrella from "raw-loader!ts-loader!../injectScript/umbrella.ts";

const patchedUmbrella = umbrella.replace("export {};", "").replace("process.env.NODE_ENV", `"${String(process.env.NODE_ENV)}"`);

const container = document.head || document.documentElement;

try {
  const immediateScriptElement = document.createElement("script");
  immediateScriptElement.textContent = patchedUmbrella;

  container.insertBefore(immediateScriptElement, container.children[0]);
  container.removeChild(immediateScriptElement);
} catch (error) {
  console.warn("[Aurox Wallet] Failed to inject using immediately executing script", error);
}

try {
  document.documentElement.setAttribute("onreset", patchedUmbrella);
  document.documentElement.dispatchEvent(new CustomEvent("reset"));
  document.documentElement.removeAttribute("onreset");
} catch (error) {
  console.warn("[Aurox Wallet] Failed to inject using the event system", error);
}

const injectScriptElement = document.createElement("script");

injectScriptElement.setAttribute("async", "false");
injectScriptElement.setAttribute("data-aurox-id", chrome.runtime.id);
injectScriptElement.setAttribute("src", INJECT_SCRIPT_URL);
container.insertBefore(injectScriptElement, container.children[0]);
container.removeChild(injectScriptElement);
