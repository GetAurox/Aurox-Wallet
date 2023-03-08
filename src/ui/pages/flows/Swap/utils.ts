import { TokenSwapRoute } from "common/types";

export function getTokenSwapRouteStages(swapRoute?: TokenSwapRoute | null) {
  if (!swapRoute) {
    return null;
  }

  return swapRoute.map(routeItem => routeItem.name);
}

export function normalizeTokenSwapRouteStages(swapRouteStages?: string[] | null) {
  if (!swapRouteStages) {
    return null;
  }

  const firstTwo = swapRouteStages.slice(0, 2);
  const lastTwo = swapRouteStages.slice(-2);

  return swapRouteStages.length > 4 ? [...firstTwo, "...", ...lastTwo] : swapRouteStages;
}
