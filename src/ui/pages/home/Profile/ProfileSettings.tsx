import { List } from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  RestartAlt as RestartAltIcon,
  InfoOutlined as InfoOutlinedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from "@mui/icons-material";

import CommonListItem from "ui/components/common/CommonListItem";

import { IconArrow, IconNetworks, IconPassword, IconRecovery, IconSecurity, IconTestnet, IconGeneral } from "ui/components/icons";

const settingsConfig = [
  { startIcon: <IconGeneral />, primaryLabel: "General", href: "general" },
  { startIcon: <IconPassword />, primaryLabel: "Change Password", href: "change-password" },
  { startIcon: <IconSecurity />, primaryLabel: "Security", href: "security" },
  // TODO: uncomment later
  // { startIcon: <AccessTimeIcon />, primaryLabel: "Idle Timeout", href: "idle-timeout" },
  { startIcon: <IconRecovery />, primaryLabel: "Show Recovery Phrase", href: "reveal-mnemonic" },
  { startIcon: <IconNetworks />, primaryLabel: "Networks", href: "networks" },
  // TODO: uncomment later
  // { startIcon: <IconTestnet />, primaryLabel: "Testnet Mode", href: "testnets" },
  // TODO: uncomment later
  // { startIcon: <CheckCircleOutlineIcon />, primaryLabel: "Token Approvals", href: "token-approvals" },
  { startIcon: <RestartAltIcon />, primaryLabel: "Reset Wallet", href: "reset-wallet" },
  { startIcon: <InfoOutlinedIcon />, primaryLabel: "About", href: "about" },
];

export default function ProfileSettings() {
  return (
    <>
      <List disablePadding>
        {settingsConfig.map((setting, index) => (
          <CommonListItem
            key={index}
            spacing={1.5}
            dividerVariant="middle"
            endIcon={<IconArrow />}
            href={`/${setting.href}`}
            startIcon={setting.startIcon}
            primaryLabel={setting.primaryLabel}
            divider={settingsConfig.length !== index + 1}
          />
        ))}
      </List>
    </>
  );
}
