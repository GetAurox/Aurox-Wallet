import { applyPatches, Patch, produceWithPatches } from "immer";

import { registerSyncQueryResponder, broadcast, SenderACL } from "common/messaging";
import { getValidTabIds } from "common/chrome";
import {
  addToCommonStateConnectedTabIdsOnSessionArea,
  loadCommonStateConnectedTabIdsFromSessionArea,
  saveCommonStateConnectedTabIdsToSessionArea,
} from "common/storage";

import { COMMON_STATE_FETCH_PREFIX, COMMON_STATE_BROADCAST_PATCHES_PREFIX } from "./constants";

export class CommonStateProvider<Topic extends string, Data extends NonNullable<object>> {
  private _topic: Topic;
  private _fetchTopic: string;
  private _broadcastPatchesTopic: string;

  private _connectedTabIds = new Set<number>();

  private _currentState: Data;

  private _unregisterResponder: () => void;

  constructor(topic: Topic, initialValue: Data, acl: SenderACL) {
    this._currentState = initialValue;

    this._topic = topic;
    this._fetchTopic = `${COMMON_STATE_FETCH_PREFIX}::${topic}`;
    this._broadcastPatchesTopic = `${COMMON_STATE_BROADCAST_PATCHES_PREFIX}::${topic}`;

    this._unregisterResponder = registerSyncQueryResponder<void, Data>(this._fetchTopic, acl, event => {
      if (event.match.source === "content-script" || event.match.source === "web-view") {
        addToCommonStateConnectedTabIdsOnSessionArea(topic, event.match.tabId);
        this._connectedTabIds.add(event.match.tabId);
      }

      return this._currentState;
    });

    this.sendPatches([{ op: "replace", path: [], value: this._currentState }]);
  }

  private async sendPatches(patches: Patch[], tabIds?: number[]) {
    const connectedTabs = tabIds ? tabIds : await loadCommonStateConnectedTabIdsFromSessionArea(this._topic);

    if (connectedTabs.length === 0) {
      await broadcast<{ patches: Patch[] }>(this._broadcastPatchesTopic, { internals: "all" }, { patches });

      return;
    }

    const validTabIds = new Set(await getValidTabIds());

    for (const tabId of this._connectedTabIds) {
      validTabIds.add(tabId);
    }

    const validConnectedTabIds = [];

    for (const tabId of connectedTabs) {
      if (validTabIds.has(tabId)) {
        validConnectedTabIds.push(tabId);
      }
    }

    if (validConnectedTabIds.length !== connectedTabs.length) {
      this._connectedTabIds = new Set(validConnectedTabIds);

      await saveCommonStateConnectedTabIdsToSessionArea(this._topic, validConnectedTabIds);
    }

    await broadcast<{ patches: Patch[] }>(this._broadcastPatchesTopic, { internals: "all", tabIds: validConnectedTabIds }, { patches });
  }

  public update = async (recipe: (draft: Data) => void | Data, tabIds?: number[]) => {
    const [newState, patches] = produceWithPatches(this._currentState, recipe);

    if (newState !== this._currentState) {
      this._currentState = newState;

      await this.sendPatches(patches, tabIds);
    }
  };

  public patch = async (patches: Patch[]) => {
    const newState = applyPatches(this._currentState, patches);

    if (newState !== this._currentState) {
      this._currentState = newState;

      await this.sendPatches(patches);
    }
  };

  public destroy() {
    this._unregisterResponder();
  }
}
