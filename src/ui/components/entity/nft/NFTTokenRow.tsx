import { useCallback } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";

import { Divider, Typography } from "@mui/material";

import { IconEthereum } from "ui/components/icons";

import { formatPrice, formatAbbreviated } from "ui/common/utils";
import { GraphQLMarketsNFTToken } from "ui/types";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: 111,
    color: theme.palette.text.primary,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
  },
  infoBox: {
    display: "flex",
    alignItems: "center",
    margin: "0 16px",
  },
  icon: {
    width: 72,
    height: 72,
    marginRight: 8,
    borderRadius: 8,
  },
  tokenNameWrapper: {
    width: 125,
    whiteSpace: "nowrap",
  },
  enumeration: {
    float: "left",
    padding: "1px 4px 0px 4px",
    marginTop: 1,
    marginRight: 3,
    color: theme.palette.text.primary,
    background: theme.palette.primary.main,
    fontWeight: 500,
    fontSize: 11,
    lineHeight: "14px",
    letterSpacing: theme.typography.pxToRem(0.15),
    borderRadius: 3,
  },
  name: {
    overflow: "hidden",
    fontWeight: 500,
    fontSize: 16,
    lineHeight: "20px",
    letterSpacing: theme.typography.pxToRem(0.15),
    textOverflow: "ellipsis",
  },
  protocol: {
    color: theme.palette.text.secondary,
    fontSize: 14,
    lineHeight: "30px",
    letterSpacing: theme.typography.pxToRem(0.25),
  },
  volume: {
    color: theme.palette.text.secondary,
    fontSize: 14,
    lineHeight: "20px",
    letterSpacing: theme.typography.pxToRem(0.25),
  },
  volumeValue: {
    color: theme.palette.text.primary,
  },
  volumeText: {
    marginBottom: 3,
  },
  iconEth: {
    float: "left",
    width: 21,

    "& > path:first-child": {
      fill: "#000",
    },
  },
  priceBox: {
    display: "flex",
    alignItems: "end",
    flexDirection: "column",
    height: "100%",
    marginRight: 2,
    marginLeft: "auto",
    fontSize: 14,
  },
  capText: {
    color: theme.palette.text.secondary,
    fontSize: 12,
    lineHeight: "16px",
    letterSpacing: theme.typography.pxToRem(0.5),
  },
  divider: {
    "&.MuiDivider-root": {
      margin: "0 16px",
      borderColor: theme.palette.custom.grey["19"],
    },
  },
}));

export interface NFTTokenRowProps {
  token: GraphQLMarketsNFTToken;
  index?: number;
  onClick?: (token: GraphQLMarketsNFTToken) => void;
}

export default function NFTTokenRow(props: NFTTokenRowProps) {
  const { token, onClick, index } = props;

  const classes = useStyles();

  const handleClick = useCallback(() => {
    onClick && onClick(token);
  }, [onClick, token]);

  const image = token.metadata.image_url;
  const ethPrice = token.metadata.last_sale?.payment_token.eth_price || 0;
  const usdPrice = token.metadata.last_sale?.payment_token.usd_price || 0;

  return (
    <>
      <a className={classes.root} onClick={handleClick}>
        <div className={classes.infoBox}>
          <img src={image} className={classes.icon} />

          <div className={classes.tokenNameWrapper}>
            {index && <span className={classes.enumeration}>{index}</span>}
            <Typography component="h4" variant="inherit" className={classes.name} title={`${token.collectionName} #${token.tokenId}`}>
              {`${token.collectionName} #${token.tokenId}`}
            </Typography>

            <Typography component="p" variant="inherit" className={classes.protocol} title={"ERC20"}>
              ERC20
            </Typography>

            <Typography component="p" variant="inherit" className={classes.volume}>
              Volume <span className={classes.volumeValue}>{formatAbbreviated(0)}</span>
            </Typography>
          </div>
          <div className={classes.priceBox}>
            <Typography component="span" variant="inherit" className={classes.volumeText}>
              <IconEthereum className={classes.iconEth} />
              {formatPrice(ethPrice)}{" "}
            </Typography>
            <Typography component="span" variant="inherit" className={classes.capText}>
              {"$"}
              {formatAbbreviated(usdPrice)}
            </Typography>
          </div>
        </div>
      </a>
      <Divider className={classes.divider} />
    </>
  );
}
