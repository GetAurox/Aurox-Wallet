import { useEffect, useState } from "react";

import noop from "lodash/noop";

import { SwapDetails } from "common/wallet";
import { getAccountAddressForChainType } from "common/utils";
import { getExchangeManagers } from "common/wallet/swap/swap";

import { EVMTransactionService } from "common/transactions";

import { useLocalUserPreferences } from "../storage";
import { useActiveAccount, useActiveAccountBalanceOfNativeAsset, useNetworkGetter } from "../states";

export function useTokenSwap(exchange: SwapDetails & { swapContract: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [swapService, setSwapService] = useState<EVMTransactionService>();
  const [approvalService, setApprovalService] = useState<EVMTransactionService>();

  const activeAccount = useActiveAccount();
  const networkGetter = useNetworkGetter();
  const [userPreferences] = useLocalUserPreferences();

  const nativeBalance = useActiveAccountBalanceOfNativeAsset(exchange.tokens.from?.networkIdentifier);

  const { general } = userPreferences;
  const gasPresets = general?.gasPresets;

  useEffect(() => {
    const { tokens, amounts, swapContract, slippage, gasless } = exchange;

    if (
      !activeAccount ||
      !tokens.from ||
      !tokens.to ||
      !amounts.from ||
      !amounts.to ||
      !swapContract ||
      !slippage ||
      !nativeBalance?.balance
    ) {
      return;
    }

    let mounted = true;
    let cleanup = noop;

    const networkGasPresets = gasPresets ? gasPresets[tokens.from.networkIdentifier] : undefined;

    const initializeManager = async () => {
      try {
        setLoading(true);

        const accountAddress = getAccountAddressForChainType(activeAccount, "evm");

        const network = networkGetter(tokens.from?.networkIdentifier);

        if (!network) {
          throw new Error("Was not able to resolve network");
        }

        const { approvalManager, swapManager } = await getExchangeManagers({
          accountInfo: activeAccount,
          network,
          tokens,
          amounts,
          swapContract,
          slippage,
          gasless,
          accountAddress,
          userBalance: nativeBalance.balance,
          gasPresets: networkGasPresets,
        });

        if (mounted) {
          setSwapService(swapManager);
          setApprovalService(approvalManager ?? undefined);
          setError("");
        }

        cleanup = () => {
          swapManager?.cancelUpdate?.();
          approvalManager?.cancelUpdate?.();
        };
      } catch (error) {
        console.error(error);

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeManager();

    return () => {
      cleanup?.();

      mounted = false;
    };
  }, [activeAccount, exchange, gasPresets, networkGetter, nativeBalance?.balance]);

  return { swapService, approvalService, error, loading };
}
