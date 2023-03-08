export function blockingRequests(status = false) {
  const id_rule = "block-all-sites";

  const disableRulesetIds = [];
  const enableRulesetIds = [];

  if (status) {
    enableRulesetIds.push(id_rule);
  } else {
    disableRulesetIds.push(id_rule);
  }

  if (enableRulesetIds.length > 0 || disableRulesetIds.length > 0) {
    // todo some isuues - https://aurox.app/oule
    /*chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds,
      disableRulesetIds,
    });*/
  }
}
