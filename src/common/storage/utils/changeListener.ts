export interface StorageChangeEvent<T> {
  topic: string;
  area: chrome.storage.AreaName;
  newValue?: T;
  oldValue?: T;
}

export type AddStorageChangeListener<T> = (callback: (event: StorageChangeEvent<T>) => void) => () => void;

export function createAddStorageChangeListener<T>(targetTopic: string, targetArea: chrome.storage.AreaName): AddStorageChangeListener<T> {
  return callback => {
    const handler = (changes: Record<string, chrome.storage.StorageChange>, area: chrome.storage.AreaName) => {
      if (area === targetArea && changes[targetTopic]) {
        callback({
          topic: targetTopic,
          area: targetArea,
          newValue: changes[targetTopic].newValue,
          oldValue: changes[targetTopic].oldValue,
        });
      }
    };

    chrome.storage.onChanged.addListener(handler);

    return () => {
      chrome.storage.onChanged.removeListener(handler);
    };
  };
}
