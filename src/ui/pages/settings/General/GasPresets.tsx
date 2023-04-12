import produce from "immer";
import isEmpty from "lodash/isEmpty";

import { List, Switch, Typography } from "@mui/material";

import { defaultUserPreferences } from "common/storage";

import { useLocalUserPreferences, useNetworkByIdentifier } from "ui/hooks";
import { useHistoryGoBack, useHistoryPathParams, useHistoryPush } from "ui/common/history";

import { IconArrow } from "ui/components/icons";
import Header from "ui/components/layout/misc/Header";
import CommonListItem from "ui/components/common/CommonListItem";

const sxStyles = {
  listItem: {
    listItemButton: {
      "&.MuiListItemButton-root": {
        px: 2,
      },
    },
  },
};

export default function GasPresets() {
  const { networkIdentifier = "" } = useHistoryPathParams<"networkIdentifier">();

  const [userPreferences, setUserPreferences] = useLocalUserPreferences();

  const networkName = useNetworkByIdentifier(networkIdentifier)?.name ?? "";

  const push = useHistoryPush();
  const goBack = useHistoryGoBack();

  const toggleEnable = () => {
    setUserPreferences(
      produce(draft => {
        if (!draft.general) {
          draft.general = defaultUserPreferences.general!;
        }

        if (!draft.general.gasPresets) {
          draft.general.gasPresets = defaultUserPreferences.general!.gasPresets!;
        }

        if (!draft.general.gasPresets[networkIdentifier]) {
          draft.general.gasPresets[networkIdentifier] = { enabled: true };
        } else {
          draft.general.gasPresets[networkIdentifier].enabled = !draft.general.gasPresets[networkIdentifier].enabled;
        }
      }),
    );
  };

  const handleGasPresets = (level: string) => () => {
    push(`/general/gas-presets/form/${level}/${networkIdentifier}`);
  };

  const isPresetEnabled = userPreferences.general?.gasPresets?.[networkIdentifier]?.enabled ?? false;
  const isLowCustom = !isEmpty(userPreferences.general?.gasPresets?.[networkIdentifier]?.low);
  const isMediumCustom = !isEmpty(userPreferences.general?.gasPresets?.[networkIdentifier]?.medium);
  const isHighCustom = !isEmpty(userPreferences.general?.gasPresets?.[networkIdentifier]?.high);

  return (
    <>
      <Header title={`${networkName} Gas Presets`} onBackClick={goBack} />
      <List disablePadding>
        <CommonListItem
          divider
          spacing={1.5}
          primaryLabel="Enable"
          dividerVariant="middle"
          endIcon={<Switch checked={isPresetEnabled} onClick={toggleEnable} />}
          sx={sxStyles.listItem}
        />
        <CommonListItem
          divider
          spacing={1.5}
          dividerVariant="middle"
          primaryLabel="Low"
          onClick={handleGasPresets("low")}
          disabled={!isPresetEnabled}
          endIcon={
            <>
              <Typography>{isLowCustom ? "Custom" : "Default"}</Typography>
              <IconArrow />
            </>
          }
          sx={sxStyles.listItem}
        />
        <CommonListItem
          divider
          spacing={1.5}
          dividerVariant="middle"
          primaryLabel="Medium"
          onClick={handleGasPresets("medium")}
          disabled={!isPresetEnabled}
          endIcon={
            <>
              <Typography>{isMediumCustom ? "Custom" : "Default"}</Typography>
              <IconArrow />
            </>
          }
          sx={sxStyles.listItem}
        />
        <CommonListItem
          divider
          spacing={1.5}
          dividerVariant="middle"
          primaryLabel="High"
          onClick={handleGasPresets("high")}
          disabled={!isPresetEnabled}
          endIcon={
            <>
              <Typography>{isHighCustom ? "Custom" : "Default"}</Typography>
              <IconArrow />
            </>
          }
          sx={sxStyles.listItem}
        />
      </List>
    </>
  );
}
