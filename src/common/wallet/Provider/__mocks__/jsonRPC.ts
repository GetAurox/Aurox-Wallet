// Using a hardcoded revert message, as I had difficulty programmatically encoding revert data. This came directly from a contract revert where the revertMessage was supplied
export const mockUnsuccessfulCallRevertData = {
  revertMessage: "Contract Call Reverted",
  revertData:
    "0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000016436f6e74726163742043616c6c20526576657274656400000000000000000000",
};
