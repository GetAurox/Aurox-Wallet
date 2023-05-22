import { ChangeEvent, useEffect, useState } from "react";
import produce from "immer";

import { InputAdornment, Link, Stack } from "@mui/material";

import { BigNumber } from "ethers";

import { defaultUserPreferences } from "common/storage";
import { EVMProvider, ProviderManager } from "common/wallet";

import { GasPresetSettings } from "ui/types";
import { useLocalUserPreferences, useNetworkByIdentifier } from "ui/hooks";
import { useHistoryGoBack, useHistoryPathParams } from "ui/common/history";

import DefaultControls from "ui/components/controls/DefaultControls";
import TextField from "ui/components/form/TextField";
import Header from "ui/components/layout/misc/Header";

export default function GasPresetsForm() {
  const { level, networkIdentifier = "" } = useHistoryPathParams<"level" | "networkIdentifier">();

  const [userPreferences, setUserPreferences] = useLocalUserPreferences();

  const preset = userPreferences?.general?.gasPresets?.[networkIdentifier]?.[level as keyof Omit<GasPresetSettings, "enabled">];

  const [baseFee, setBaseFee] = useState<string>(preset?.baseFee ?? "");
  const [gasLimit, setGasLimit] = useState<string>(preset?.gasLimit ?? "");
  const [gasPrice, setGasPrice] = useState<string>(preset?.gasPrice ?? "");
  const [priorityFee, setPriorityFee] = useState<string>(preset?.priorityFee ?? "");
  const [networkFormat, setNetworkFormat] = useState<"EIP1559" | "Legacy" | null>(null);

  const network = useNetworkByIdentifier(networkIdentifier);

  const goBack = useHistoryGoBack();

  const handleSave = () => {
    setUserPreferences(
      produce(draft => {
        if (!draft.general) {
          draft.general = defaultUserPreferences.general!;
        }

        draft.general.gasPresets![networkIdentifier][level as keyof Omit<GasPresetSettings, "enabled">] = {
          priorityFee: priorityFee !== "" ? priorityFee : undefined,
          baseFee: baseFee !== "" ? baseFee : undefined,
          gasLimit: gasLimit !== "" ? gasLimit : undefined,
          gasPrice: gasPrice !== "" ? gasPrice : undefined,
        };
      }),
    );

    goBack();
  };

  const handleChangePriorityFee = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = event.target.value;

    const parsedValue = parseFloat(newValue);

    if ((!isNaN(parsedValue) && parsedValue >= 0) || newValue === "") {
      setPriorityFee(parsedValue.toString());
    }
  };

  const handleChangeBaseFee = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = event.target.value;

    const parsedValue = parseFloat(newValue);

    if ((!isNaN(parsedValue) && parsedValue >= 1) || newValue === "") {
      setBaseFee(parsedValue.toString());
    }
  };

  const handleChangeGasLimit = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = event.target.value;

    const parsedValue = parseFloat(newValue);

    if ((!isNaN(parsedValue) && parsedValue >= 1) || newValue === "") {
      setGasLimit(parsedValue.toString());
    }
  };

  const handleChangeGasPrice = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = event.target.value;

    const parsedValue = parseFloat(newValue);

    if ((!isNaN(parsedValue) && parsedValue >= 0) || newValue === "") {
      setGasPrice(parsedValue.toString());
    }
  };

  const handleClearPriorityFee = () => {
    setPriorityFee("");
  };

  const handleClearBaseFee = () => {
    setBaseFee("");
  };

  const handleClearGasLimit = () => {
    setGasLimit("");
  };

  const handleClearGasPrice = () => {
    setGasPrice("");
  };

  const handleClearAll = () => {
    handleClearPriorityFee();
    handleClearBaseFee();
    handleClearGasLimit();
    handleClearGasPrice();
  };

  const handleBack = () => {
    handleClearAll();
    goBack();
  };

  const networkName = network?.name ?? "";

  useEffect(() => {
    const getNetworkFormat = async () => {
      if (!network) return null;

      try {
        const { provider } = ProviderManager.getProvider(network) as EVMProvider;

        const block = await provider.getBlock("latest");

        const isEIP1559 = BigNumber.isBigNumber(block.baseFeePerGas);

        return isEIP1559 ? "EIP1559" : "Legacy";
      } catch (error) {
        console.error("Can not get network format", error);

        return null;
      }
    };

    getNetworkFormat().then(setNetworkFormat);
  }, [network]);

  const disabledSave =
    (priorityFee === "" && baseFee === "" && gasLimit === "" && gasPrice === "") ||
    (priorityFee === preset?.priorityFee && baseFee === preset.baseFee && gasLimit === preset.gasLimit && gasPrice === preset.gasPrice);

  if (!networkFormat) return null;

  return (
    <>
      <Header title={`${networkName} Gas Presets`} onBackClick={handleBack} />

      <Stack rowGap={1.5} mx={2}>
        <TextField
          onChange={handleChangeGasLimit}
          value={gasLimit}
          type="number"
          label="Gas limit"
          onClear={handleClearGasLimit}
          endAdornment={<InputAdornment position="end">%</InputAdornment>}
        />
        {networkFormat === "EIP1559" && (
          <TextField
            onChange={handleChangeBaseFee}
            type="number"
            value={baseFee}
            label="Base fee"
            onClear={handleClearBaseFee}
            endAdornment={<InputAdornment position="end">%</InputAdornment>}
          />
        )}

        {networkFormat === "Legacy" && (
          <TextField
            type="number"
            value={gasPrice}
            label="Gas price (GWEI)"
            onClear={handleClearGasPrice}
            onChange={handleChangeGasPrice}
            helper={
              <Link
                target="_blank"
                variant="medium"
                underline="hover"
                rel="noopener noreferrer"
                href="https://docs.getaurox.com/product-docs/aurox-wallet-guides"
              >
                Need help?
              </Link>
            }
          />
        )}
        {networkFormat === "EIP1559" && (
          <TextField
            type="number"
            value={priorityFee}
            label="Priority fee (GWEI)"
            onClear={handleClearPriorityFee}
            onChange={handleChangePriorityFee}
            helper={
              <Link
                target="_blank"
                variant="medium"
                underline="hover"
                rel="noopener noreferrer"
                href="https://docs.getaurox.com/product-docs/aurox-wallet-guides"
              >
                Need help?
              </Link>
            }
          />
        )}
      </Stack>

      <DefaultControls primary="Save" secondary="Cancel" onPrimary={handleSave} onSecondary={goBack} disabledPrimary={disabledSave} />
    </>
  );
}
