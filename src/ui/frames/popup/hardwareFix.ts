if (chrome?.windows?.getCurrent) {
  const originalGetCurrent = chrome.windows.getCurrent.bind(chrome.windows);

  // This fix is needed so that trezor detects the current context as being the window popup
  (chrome as any).windows.getCurrent = async (_: any, callback: (window: any) => void) => {
    const window = await originalGetCurrent();

    const fixed = { ...window, type: "popup" };

    callback?.(fixed);

    return fixed;
  };
}
