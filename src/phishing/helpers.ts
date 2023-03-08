import sampleSize from "lodash/sampleSize";

import { InitOptions } from "./types";

import getStyle from "./style";

function inlineStyle(styleObject: Record<string, any>) {
  let style = "";

  for (const [selector, styles] of Object.entries(styleObject)) {
    if (selector.indexOf("@media") !== -1) {
      style += `${selector}{${inlineStyle(styleObject[selector])}}`;

      continue;
    }

    style += `.${selector}{`;

    for (const [cssProp, value] of Object.entries(styles)) {
      style += `${cssProp}:${value};`;
    }

    style += "}";
  }

  return style;
}

function randomString(size = 15) {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const alphabet = letters + "1234567890";

  return [...sampleSize(letters, 1), ...sampleSize(alphabet, size)].join("");
}

export function getOverlay({ onBack, onContinue }: InitOptions) {
  const id = randomString();

  const style = document.createElement("style");
  style.innerHTML = inlineStyle(getStyle(id));

  const overlay = document.createElement("div");
  overlay.setAttribute("id", id);
  overlay.setAttribute("class", `${id}-overlay`);

  const top = document.createElement("div");
  top.setAttribute("class", `${id}-top`);

  const logo = document.createElement("div");
  logo.setAttribute("class", `${id}-logo`);

  top.appendChild(logo);
  overlay.appendChild(top);

  const container = document.createElement("div");
  container.setAttribute("class", `${id}-container`);

  const inner = document.createElement("div");
  inner.setAttribute("class", `${id}-inner`);

  const warn = document.createElement("div");
  warn.setAttribute("class", `${id}-warn`);

  inner.appendChild(warn);

  const content = document.createElement("div");
  content.setAttribute("class", `${id}-content`);

  const title = document.createElement("h1");
  title.setAttribute("class", `${id}-title`);
  title.innerHTML = "Potential Phishing Attempt";
  content.appendChild(title);

  const text = document.createElement("p");
  text.setAttribute("class", `${id}-text`);
  text.innerHTML = `
    Attackers on this site may be tricking you into stealing your crypto wallet. Aurox Wallet has detected that you tried to enter your private key or recovery phrase into this website.
    <br/><br/>
    Remember to never share your recovery phrase or private key with anyone. Disclosing either of these items online can lead to a loss of funds. It gives attackers the ability to recover and take control of your wallet!
  `;
  content.appendChild(text);

  const protectButton = document.createElement("button");
  protectButton.innerHTML = "Back to safety";
  protectButton.setAttribute("class", `${id}-button ${id}-backButton`);
  protectButton.addEventListener("click", () => {
    style.remove();
    overlay.remove();

    onBack();
  });
  content.appendChild(protectButton);

  const proceedButton = document.createElement("button");
  proceedButton.innerHTML = "Continue at my own risk";
  proceedButton.setAttribute("class", `${id}-button ${id}-continueButton`);
  proceedButton.addEventListener("click", () => {
    style.remove();
    overlay.remove();

    onContinue();
  });
  content.appendChild(proceedButton);

  inner.appendChild(content);
  container.appendChild(inner);
  overlay.appendChild(container);

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  return overlay;
}
