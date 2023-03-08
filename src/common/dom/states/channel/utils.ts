import { StateFragment } from "common/types";

import { DOMStateProvider } from "./DOMStateProvider";

/**
 * Creates a new provider by attaching an state fragment to it. The provider will sync all of its corresponding consumers
 * with the state of the fragment that it wraps.
 * @param topic The topic for provider
 * @param fragment the state fragment that will be wrapped by the state provider
 * @returns the newly constructed provider
 */
export function createDOMStateProviderFromFragment<F>(topic: string, fragment: StateFragment<F>): DOMStateProvider<F> {
  const provider = new DOMStateProvider<F>(topic, fragment.getCurrent());

  const handler = (newFragment: F) => provider.setState(newFragment);

  fragment.addListener("changed", handler);

  provider.once("destroyed", () => fragment.removeListener("changed", handler));

  return provider;
}
