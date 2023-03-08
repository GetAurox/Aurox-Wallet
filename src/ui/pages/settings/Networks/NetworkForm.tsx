import { ChangeEvent, memo, MouseEvent, useMemo } from "react";
import produce from "immer";

import { Stack } from "@mui/material";

import FormField from "ui/components/form/FormField";
import Header from "ui/components/layout/misc/Header";
import DefaultControls from "ui/components/controls/DefaultControls";

import { Network } from "common/operations";
import { createNetworkIdentifier } from "common/utils";
import { BlockchainNetwork, BlockchainNetworkConnection, BlockchainNetworkExplorer } from "common/types";

import { getHostname } from "ui/common/utils";
import { initialBlockchainNetworkValues } from "ui/common/networks";
import { isRPCProviderURL, isNonEmpty, isURL, isHexadecimal, isDecimal } from "ui/common/validators";
import { useHistoryGoBack, useHistoryPathParams, useNetworkHistoryState } from "ui/common/history";

import { Validation, useChainList, ChainList, useForm, useNetworkByIdentifier } from "ui/hooks";

const sxStyles = {
  formField: {
    helper: {
      "&.MuiFormHelperText-root": {
        color: "error.main",
      },
    },
  },
};

const hexToDecimal = (hex: string) => parseInt(hex, 16);

const checkConnection = async (
  connection: BlockchainNetworkConnection,
  index: number,
  chainId: string,
  changeModel: (networkModel: BlockchainNetwork) => void,
  networkModel: BlockchainNetwork,
) => {
  const isMainConnection = index === 0;

  if (isMainConnection && !isNonEmpty(connection.url)) return { connections: { 0: "The URL is required" } };

  if (!isMainConnection && connection.url === "") return true;

  if (!isURL(connection.url)) return { connections: { [index]: "The URL should be http(s) URL" } };

  const result = await isRPCProviderURL(connection.url);

  if (result === null) return { connections: { [index]: `The response from ${connection.url} is incorrect` } };

  if (result.failed) return { connections: { [index]: result.error.message } };

  const chainIdFromRpc = hexToDecimal(result.response.result);

  if (isMainConnection && chainId && parseInt(chainId) !== -1 && parseInt(chainId) !== chainIdFromRpc) {
    return { chainId: `Chain ID is not the same as from RPC URL (${chainIdFromRpc})` };
  }

  if (isMainConnection && parseInt(chainId) === -1 && chainIdFromRpc > 0) {
    const network: BlockchainNetwork = { ...networkModel };
    network.chainId = chainIdFromRpc;
    changeModel(network);
  }
};

export interface NetworkFormProps {
  testnet?: boolean;
}

export default memo(function NetworkForm(props: NetworkFormProps) {
  const { testnet } = props;

  const { networkIdentifier } = useHistoryPathParams();

  const editNetwork = useNetworkByIdentifier(networkIdentifier);

  const goBack = useHistoryGoBack();

  const [historyState, setHistoryState] = useNetworkHistoryState({
    model: initialBlockchainNetworkValues,
  });

  const initValue: BlockchainNetwork = useMemo(() => {
    if (editNetwork) {
      return editNetwork;
    }

    return historyState.model || initialBlockchainNetworkValues;
  }, [historyState.model, editNetwork]);

  const isValidationError = (field: keyof BlockchainNetwork) => (touched[field] && errors[field]) as boolean;
  const getValidationError = (field: keyof BlockchainNetwork) => (touched[field] && errors && errors[field] ? errors[field] : null);

  const isValidationConnectionsError = (index: number) =>
    (touched["connections"] && errors["connections"] && errors["connections"][index]) as boolean;
  const getValidationConnectionsError = (index: number) =>
    touched["connections"] && errors && errors["connections"] && errors["connections"][index] ? errors["connections"][index] : null;

  const { list: chainList } = useChainList();

  const validations: Validation[] = [
    ({ name }) => {
      if (!isNonEmpty(name)) return { name: "Name is required" };

      return true;
    },
    ({ shortName }) => {
      if (!isNonEmpty(shortName)) return { shortName: "Short Name is required" };

      return true;
    },
    async networkModel => {
      let result = {};

      for (const [index, connection] of (networkModel.connections as BlockchainNetworkConnection[]).entries()) {
        const checkResult = await checkConnection(connection, index, networkModel.chainId, handleModelChange, networkModel);

        if (typeof checkResult === "object") {
          result = { ...result, ...checkResult };
        }
      }

      return Object.keys(result).length > 0 ? result : true;
    },
    ({ chainId }) => {
      const chainIdStr = String(chainId);

      const isHexOrDecimal = isHexadecimal(chainIdStr) || isDecimal(chainIdStr);

      if (!isNonEmpty(chainIdStr) || !isHexOrDecimal) {
        return { chainId: "Chain ID is required and should be decimal or hexadecimal" };
      }

      return true;
    },
    ({ currencySymbol, chainId }) => {
      if (!isNonEmpty(currencySymbol)) return { currencySymbol: "Currency symbol is required" };

      if (chainList.length === 0) return { currencySymbol: "Sorry, cannot get chain list" };

      const item = chainList.find((item: ChainList) => item.chainId === parseInt(chainId));

      if (!item) return { currencySymbol: `No symbols by Chain ID${chainId ? ` "${chainId}` : ""}` };

      if (item.nativeCurrency.symbol !== currencySymbol) {
        return { currencySymbol: `Currency symbol from RPC is "${item.nativeCurrency.symbol}"` };
      }

      return true;
    },
    ({ chainExplorer }: { chainExplorer: BlockchainNetworkExplorer | null }) => {
      const baseUrl = chainExplorer?.baseURL || "";

      if (baseUrl === "") {
        return true;
      }

      if (!isNonEmpty(baseUrl) || !isURL(baseUrl)) {
        return { chainExplorer: "The URL must have an appropriate http(s) prefix" };
      }

      return true;
    },
  ];

  const {
    values: networkModel,
    isValid,
    errors,
    changeHandler,
    changeModelHandler,
    touched,
  } = useForm<BlockchainNetwork>(initValue, validations);

  const handleSave = async (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();

    // Requires casting the chainId variable to a number, as the Input component used for this field returns all values as strings
    const chainId = parseInt(networkModel.chainId.toString());

    if (editNetwork) {
      await Network.ModifyNetwork.perform(networkModel.identifier, { ...networkModel, chainId });
    } else {
      await Network.AddNetwork.perform({
        ...networkModel,
        identifier: createNetworkIdentifier(networkModel.chainType, chainId),
        chainId,
        testnet,
      });
    }

    goBack();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>, value?: string | boolean | object) => {
    setHistoryState(
      produce(draft => {
        draft.model = { ...draft.model, [event.target.name]: value !== undefined ? value : event.target.value };
      }),
    );
    changeHandler(event, value);
  };

  const handleModelChange = (model: BlockchainNetwork) => {
    setHistoryState(
      produce(draft => {
        draft.model = model;
      }),
    );
    changeModelHandler(model);
  };

  const handleOnChangeConnections = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = [...networkModel.connections];

    value[index] = { url: event.target.value };
    handleChange(event, value);
  };

  const handleOnChangeChainExplorerUrl = (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(event, {
      baseURL: event.target.value,
      name: networkModel?.chainExplorer?.name || getHostname(event.target.value),
    });
  };

  const handleOnChangeChainExplorerName = (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(event, { name: event.target.value, baseURL: networkModel?.chainExplorer?.baseURL });
  };

  const showChainExplorerName = (networkModel.chainExplorer?.baseURL || "") !== "" && !isValidationError("chainExplorer");

  const connection = networkModel.connections[0]?.url || "";
  const backupConnection = networkModel.connections[1]?.url || "";
  const disabledBackupConnection = editNetwork === null ? !touched["connections"] || isValidationConnectionsError(0) : false;

  return (
    <>
      <Header title="Add Network" onBackClick={goBack} />
      <Stack p={2} justifyContent="space-between" rowGap="25px">
        <FormField
          name="name"
          autoComplete="off"
          label="Network Name"
          sx={sxStyles.formField}
          onChange={handleChange}
          value={networkModel.name}
          placeholder="Enter Network Name"
          error={isValidationError("name")}
          helper={getValidationError("name")}
        />

        <FormField
          name="shortName"
          autoComplete="off"
          sx={sxStyles.formField}
          onChange={handleChange}
          label="Network Short Name"
          value={networkModel.shortName}
          placeholder="Enter Network Short Name"
          error={isValidationError("shortName")}
          helper={getValidationError("shortName")}
        />

        <FormField
          label="RPC URL"
          name="connections"
          autoComplete="off"
          value={connection}
          sx={sxStyles.formField}
          placeholder="Enter RPC URL"
          error={isValidationConnectionsError(0)}
          helper={getValidationConnectionsError(0)}
          onChange={event => handleOnChangeConnections(event as ChangeEvent<HTMLInputElement>, 0)}
        />

        <FormField
          name="connections"
          autoComplete="off"
          sx={sxStyles.formField}
          value={backupConnection}
          label="Backup RPC URL (Optional)"
          placeholder="Enter Backup RPC URL"
          disabled={disabledBackupConnection}
          error={isValidationConnectionsError(1)}
          helper={getValidationConnectionsError(1)}
          onChange={event => handleOnChangeConnections(event as ChangeEvent<HTMLInputElement>, 1)}
        />

        <FormField
          name="chainId"
          label="Chain ID"
          autoComplete="off"
          sx={sxStyles.formField}
          onChange={handleChange}
          placeholder="Enter Chain ID"
          error={isValidationError("chainId")}
          helper={getValidationError("chainId")}
          value={networkModel.chainId > 0 ? networkModel.chainId : ""}
        />

        <FormField
          autoComplete="off"
          name="currencySymbol"
          label="Currency Symbol"
          sx={sxStyles.formField}
          onChange={handleChange}
          placeholder="Enter Currency Symbol"
          value={networkModel.currencySymbol}
          error={isValidationError("currencySymbol")}
          helper={getValidationError("currencySymbol")}
        />

        <FormField
          autoComplete="off"
          name="chainExplorer"
          sx={sxStyles.formField}
          label="Block Explorer URL (Optional)"
          placeholder="Enter Block Explorer URL"
          error={isValidationError("chainExplorer")}
          onChange={handleOnChangeChainExplorerUrl}
          helper={getValidationError("chainExplorer")}
          value={networkModel.chainExplorer?.baseURL || ""}
        />

        {showChainExplorerName && (
          <FormField
            autoComplete="off"
            name="chainExplorer"
            sx={sxStyles.formField}
            label="Block Explorer Name(Optional)"
            placeholder="Enter Block Explorer Name"
            onChange={handleOnChangeChainExplorerName}
            value={networkModel.chainExplorer?.name || ""}
          />
        )}
      </Stack>
      <DefaultControls disabledPrimary={!isValid} onPrimary={handleSave} onSecondary={goBack} />
    </>
  );
});
