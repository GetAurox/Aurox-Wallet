import { useNavigate } from "react-router-dom";

import { Stack, Typography } from "@mui/material";

import { useOnboardingData } from "ui/hooks";

import { PickCard } from "./PickCard";

const newWalletBullets = [
  "Create an ENS username",
  "Create a password to secure your wallet",
  "Back up your 12-word recovery phrase",
  "Start using your Aurox Wallet",
];
const ExistingWalletBullets = [
  "Create an ENS username",
  "Create a password to secure your wallet ",
  "Enter your recovery phrase",
  "Start using your Aurox Wallet",
];

export const CreateWallet = () => {
  const navigate = useNavigate();
  const { update: updateOnboardingData } = useOnboardingData();

  const handleImportWallet = () => {
    updateOnboardingData({ step: "import" });
    navigate("/import-wallet");
  };

  const handleNewWallet = () => {
    updateOnboardingData({ step: "new" });
    navigate("/new-wallet");
  };
  return (
    <Stack bgcolor="bg850" borderRadius="24px" maxWidth="100%" px={[3, 6]} py={[3, 5]} width={["100%", "100%", "100%", 908]}>
      <Typography component="h2" variant="h300-xl">
        Create a new wallet or import an existing one
      </Typography>
      <Typography color="txt600" mt={1} variant="p400-xl">
        Setup your own multi-chain wallet or import an existing one using your mnemonic recovery phrase.
      </Typography>
      <Stack direction={["column", "column", "row"]} gap="32px" height="100%" mt={4}>
        <PickCard
          additionInfo="Important: Aurox cannot recover your 12-word recovery phrase for you. Aurox will soon have unique recovery methods but until then, please make sure to write down your passphrase and keep it secure."
          onClick={handleNewWallet}
          items={newWalletBullets}
          title="New wallet"
        />
        <PickCard
          additionInfo="Aurox cannot recover your password for you. Keep it secure, as you’ll need it to access the Aurox Wallet extension."
          onClick={handleImportWallet}
          items={ExistingWalletBullets}
          title="Existing wallet"
        />
      </Stack>
    </Stack>
  );
};
