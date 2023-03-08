import Decimal from "decimal.js";

import { formatAbbreviated } from "ui/common/utils";
import { TokenMarketDetails } from "ui/types";

import EqualWidthSplitColumns from "ui/components/layout/misc/EqualWidthSplitColumns";
import InfoPair from "ui/components/info/InfoPair";

export interface TokenStatsProps {
  details: TokenMarketDetails;
  price: string | null;
  decimals: number;
}

export default function TokenStats(props: TokenStatsProps) {
  const { details, price, decimals } = props;

  const fullyDilutedMarketCapUSD = new Decimal(details.totalSupply)
    .times(new Decimal(!price ? 0 : price))
    .toDP(decimals)
    .toFixed();

  return (
    <EqualWidthSplitColumns
      left={
        <>
          <InfoPair caption="Circulation Supply" value={`${formatAbbreviated(details.circulatingSupply)}`} />
          <InfoPair caption="Max Supply" value={`${formatAbbreviated(details.totalSupply)}`} />
        </>
      }
      right={
        <>
          <InfoPair caption="Market Cap" value={`$${formatAbbreviated(details.marketCapUSD)}`} />
          <InfoPair caption="Fully Diluted MCap" value={`$${formatAbbreviated(fullyDilutedMarketCapUSD)}`} />
        </>
      }
    />
  );
}
