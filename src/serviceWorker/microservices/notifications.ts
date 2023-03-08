import { v4 as uuidV4 } from "uuid";
import take from "lodash/take";

import { Notifications } from "common/operations";
import { loadNotificationsFromLocalArea, saveNotificationsToLocalArea } from "common/storage";

import { EVMTransactionsOperationManager } from "serviceWorker/managers";

export const MAX_NOTIFICATIONS_CACHE_SIZE = 30;

async function containsNotificationsSupport() {
  return await new Promise<boolean>(resolve => {
    chrome.permissions.contains({ permissions: ["notifications"] }, allowed => {
      resolve(allowed);
    });
  });
}

async function requestNotificationsSupport() {
  return await new Promise<boolean>(resolve => {
    chrome.permissions.request({ permissions: ["notifications"] }, granted => {
      resolve(granted);
    });
  });
}

async function removeNotificationsSupport() {
  return await new Promise<boolean>(resolve => {
    chrome.permissions.remove({ permissions: ["notifications"] }, removed => {
      resolve(removed);
    });
  });
}

export async function setupNotificationsService(evmTransactionsOperationManager: EVMTransactionsOperationManager) {
  let onClickedListenerAdded = false;

  Notifications.CheckNotificationsSupport.registerResponder(async () => {
    return await containsNotificationsSupport();
  });

  Notifications.RequestNotificationsSupport.registerResponder(async () => {
    return await requestNotificationsSupport();
  });

  Notifications.RemoveNotificationsSupport.registerResponder(async () => {
    return await removeNotificationsSupport();
  });

  evmTransactionsOperationManager.addListener("evm-transaction-confirmed", async data => {
    const allowed = await containsNotificationsSupport();

    if (!allowed) return;

    const { title, message, blockExplorerURL } = data;
    const notificationId = uuidV4();
    let cache = await loadNotificationsFromLocalArea();

    if (blockExplorerURL) {
      if (!cache) {
        cache = [];
      }

      // Cache new notification data and managing cache size so it doesn't exceed given size
      await saveNotificationsToLocalArea(take([[notificationId, blockExplorerURL], ...cache], MAX_NOTIFICATIONS_CACHE_SIZE));
    }

    chrome.notifications.create(notificationId, {
      iconUrl: "assets/manifest/logo128x128.png",
      title,
      message,
      type: "basic",
    });

    if (!onClickedListenerAdded) {
      chrome.notifications.onClicked.addListener(async (notificationId: string) => {
        const cache = await loadNotificationsFromLocalArea();

        if (cache) {
          const url = cache.find(entry => entry[0] === notificationId)?.[1];

          if (url) {
            // Remove shown notification from cache
            await saveNotificationsToLocalArea(cache.filter(entry => entry[0] !== notificationId));

            chrome.tabs.create({ url });
          }
        }
      });

      onClickedListenerAdded = true;
    }
  });
}
