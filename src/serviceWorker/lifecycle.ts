import sw from "common/sw";

sw.addEventListener("install", () => {
  sw.skipWaiting();
});
