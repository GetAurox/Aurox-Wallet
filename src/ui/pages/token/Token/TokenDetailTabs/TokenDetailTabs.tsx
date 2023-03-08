import { Tab, Tabs } from "@mui/material";

import { useHistoryState } from "ui/common/history";
import { TokenDisplayWithTicker } from "ui/types";

import TokenTabTransactions from "./TokenTabTransactions";
import TokenTabHoldings from "./TokenTabHoldings";
import TokenTabPanel from "./TokenTabPanel";

export interface TokenDetailTabsProps {
  token: TokenDisplayWithTicker;
}

type DetailTab = "holdings" | "transactions";

export default function TokenDetailTabs(props: TokenDetailTabsProps) {
  const { token } = props;

  const [tab, setTab] = useHistoryState<DetailTab>("activeDetailsTab", "holdings");

  const handleTabChange = (event: any, newTab: DetailTab) => {
    setTab(newTab);
  };

  return (
    <>
      <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
        <Tab value="holdings" label="My Holdings" />
        <Tab value="transactions" label="Transactions" />
      </Tabs>
      <TokenTabPanel active={tab === "holdings"}>
        <TokenTabHoldings token={token} />
      </TokenTabPanel>
      <TokenTabPanel active={tab === "transactions"}>
        <TokenTabTransactions token={token} />
      </TokenTabPanel>
    </>
  );
}
