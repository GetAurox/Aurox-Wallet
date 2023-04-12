import { ReactElement } from "react";
import produce from "immer";

import { Link, List, Switch } from "@mui/material";

import { defaultUserPreferences, UserPreferences } from "common/storage";

import { useLocalUserPreferences } from "ui/hooks";
import { useHistoryGoBack, useHistoryPush } from "ui/common/history";

import { IconArrow } from "ui/components/icons";
import Header from "ui/components/layout/misc/Header";
import CommonListItem from "ui/components/common/CommonListItem";

type PreferencesKey = keyof UserPreferences["general"];

interface GeneralConfig {
  label: string;
  preferencesKey: PreferencesKey;
  description?: string | ReactElement;
}

const generalConfig: GeneralConfig[] = [
  {
    label: "Auto sort balances by chain",
    preferencesKey: "chainSorting" as PreferencesKey,
    description:
      "The balances on the home screen will be sorted based on the chain of the decentralized application. For example, it will sort your token balances with Ethereum network-based tokens at the top when you connect to Uniswap on the Ethereum network.",
  },
  {
    label: "Display percent change of Tokens on Twitter",
    preferencesKey: "twitterScript" as PreferencesKey,
    description: (
      <>
        See market movements while you browse{" "}
        <Link target="_blank" rel="noreferrer" href="https://twitter.com" underline="always">
          Twitter.com
        </Link>
        . Enabling this option will display percent change anytime someone a tweet in your feed has a cashtag or hashtag of a token!
      </>
    ),
  },
];

const sxStyles = {
  listItem: {
    listItemButton: {
      "&.MuiListItemButton-root": {
        px: 2,
      },
    },
  },
};

export default function General() {
  const [userPreferences, setUserPreferences] = useLocalUserPreferences();

  const push = useHistoryPush();
  const goBack = useHistoryGoBack();

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

  const handleGasPresets = () => {
    push("/general/gas-presets/networks");
  };

  return (
    <>
      <Header title="General" onBackClick={goBack} />

      <List disablePadding>
        {generalConfig.map(({ label, preferencesKey, description }, index) => (
          <CommonListItem
            divider
            key={index}
            spacing={1.5}
            primaryLabel={label}
            sx={sxStyles.listItem}
            dividerVariant="middle"
            secondaryLabel={description}
            endIcon={<Switch checked={getValue(preferencesKey)} onClick={createHandleToggle(preferencesKey)} />}
          />
        ))}
        {/* <CommonListItem
          spacing={1.5}
          sx={sxStyles.listItem}
          endIcon={<IconArrow />}
          dividerVariant="middle"
          primaryLabel="Gas Presets"
          onClick={handleGasPresets}
        /> */}
      </List>
    </>
  );
}
