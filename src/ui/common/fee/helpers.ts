export function getFeeEstimatedSecondsPresentation(seconds: number) {
  // 5+ should be red
  if (seconds > 60 * 5) {
    return { color: "#f24840", text: "> 5 minutes" };
  }

  // < 1 minute should be green
  if (seconds < 60) {
    return { color: "#54c06e", text: "< 1 minute" };
  }

  // 1-5 minute should be yellow
  return { color: "#f6c009", text: `~ ${Math.round(seconds / 60)} minutes` };
}
