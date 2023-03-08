import produce from "immer";

import { List, Switch } from "@mui/material";

import { UserPreferences } from "common/storage";

import Header from "ui/components/layout/misc/Header";
import { useHistoryGoBack } from "ui/common/history";
import CommonListItem from "ui/components/common/CommonListItem";

import { useLocalUserPreferences } from "ui/hooks";

type PreferencesKey = keyof UserPreferences["security"];

interface SecurityConfig {
  label: string;
  preferencesKey: PreferencesKey;
  description?: string;
}

const securityConfig: SecurityConfig[] = [
  { label: "Domain Checker", preferencesKey: "domainCheckerEnabled" },
  { label: "Simulation", preferencesKey: "dappSimulationEnabled", description: "Currently only available on the ETH network" },
  { label: "Anti-phishing", preferencesKey: "antiPhishingEnabled" },
  {
    label: "Smart Contract Monitoring",
    preferencesKey: "smartContractMonitoringEnabled",
    description: "Currently only available on ETH, AVAX, MATIC, BSC networks",
  },
];

const xsStyles = {
  listItemButton: {
    "&.MuiListItemButton-root": {
      px: 2,
    },
  },
};

export default function Security() {
  const goBack = useHistoryGoBack();

  const [userPreferences, setUserPreferences] = useLocalUserPreferences();

  const createHandleToggle = (key: PreferencesKey) => () => {
    setUserPreferences(
      produce(draft => {
        draft.security[key] = !draft.security[key];
      }),
    );
  };

  const getValue = (key: PreferencesKey) => userPreferences.security[key];

  return (
    <>
      <Header title="Security" onBackClick={goBack} />

      <List disablePadding>
        {securityConfig.map(({ label, preferencesKey, description }, index) => (
          <CommonListItem
            key={index}
            spacing={1.5}
            primaryLabel={label}
            dividerVariant="middle"
            secondaryLabel={description}
            divider={securityConfig.length !== index + 1}
            sx={{ listItemButton: xsStyles.listItemButton }}
            endIcon={<Switch checked={getValue(preferencesKey)} onClick={createHandleToggle(preferencesKey)} />}
          />
        ))}
      </List>
    </>
  );
}
