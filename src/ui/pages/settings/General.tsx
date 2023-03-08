import produce from "immer";

import { List, Switch } from "@mui/material";

import { defaultUserPreferences, UserPreferences } from "common/storage";

import Header from "ui/components/layout/misc/Header";
import { useHistoryGoBack } from "ui/common/history";
import CommonListItem from "ui/components/common/CommonListItem";

import { useLocalUserPreferences } from "ui/hooks";

type PreferencesKey = keyof UserPreferences["general"];

interface GeneralConfig {
  label: string;
  preferencesKey: PreferencesKey;
  description?: string;
}

const generalConfig: GeneralConfig[] = [
  {
    label: "Auto sort balances by chain",
    preferencesKey: "chainSorting" as PreferencesKey,
    description:
      "The balances on the home screen will be sorted based on the chain of the decentralized application. For example, it will sort your token balances with Ethereum network-based tokens at the top when you connect to Uniswap on the Ethereum network.",
  },
];

const sxStyles = {
  listItemButton: {
    "&.MuiListItemButton-root": {
      px: 2,
    },
  },
};

export default function General() {
  const goBack = useHistoryGoBack();

  const [userPreferences, setUserPreferences] = useLocalUserPreferences();

  const createHandleToggle = (key: PreferencesKey) => () => {
    setUserPreferences(
      produce(draft => {
        draft.general = {
          ...(draft.general || defaultUserPreferences?.general),
          [key]: !(draft?.general?.[key] ?? defaultUserPreferences?.general?.[key]),
        };
      }),
    );
  };

  const getValue = (key: PreferencesKey) => userPreferences?.general?.[key] ?? defaultUserPreferences?.general?.[key];

  return (
    <>
      <Header title="General" onBackClick={goBack} />

      <List disablePadding>
        {generalConfig.map(({ label, preferencesKey, description }, index) => (
          <CommonListItem
            key={index}
            spacing={1.5}
            primaryLabel={label}
            dividerVariant="middle"
            secondaryLabel={description}
            divider={generalConfig.length !== index + 1}
            sx={{ listItemButton: sxStyles.listItemButton }}
            endIcon={<Switch checked={getValue(preferencesKey)} onClick={createHandleToggle(preferencesKey)} />}
          />
        ))}
      </List>
    </>
  );
}
