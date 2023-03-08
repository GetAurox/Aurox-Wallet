export function mapServerError(serverError: string) {
  if (serverError.startsWith("cannot estimate gas")) {
    return "You don’t have enough ETH to pay the network fees.";
  }

  return serverError;
}
