import clsx from "clsx";

import { makeStyles } from "@mui/styles";

import { Theme } from "@mui/material";

import {
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Telegram as TelegramIcon,
  Reddit as RedditIcon,
  CurrencyBitcoin as BitcoinTalkIcon,
} from "@mui/icons-material";

import { TokenMarketDetailsSocial } from "ui/types";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
  },
  link: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 14,
    color: theme.palette.text.primary,
    textDecoration: "none",

    "&:hover": {
      textDecoration: "none",
      opacity: 0.7,
    },

    "&+$link": {
      marginLeft: 12,
    },
  },
  facebook: {
    backgroundColor: "#3b5998",
  },
  twitter: {
    backgroundColor: "#55acee",
  },
  telegram: {
    backgroundColor: "#0088cc",
  },
  reddit: {
    backgroundColor: "#ff4500",
  },
  bitcointalk: {
    backgroundColor: "#f7931a",
  },
  icon: {
    maxWidth: 20,
    maxHeight: 20,
  },
}));

export interface TokenSocialsProps {
  socials: TokenMarketDetailsSocial[];
}
export default function TokenSocials(props: TokenSocialsProps) {
  const { socials } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      {socials.map((s, index) => {
        switch (s.network) {
          case "facebook":
            return (
              s.url && (
                <a
                  key={`facebook${index}`}
                  className={clsx(classes.link, classes.facebook)}
                  href={s.url}
                  target="_blank"
                  title="Facebook"
                  rel="noreferrer"
                >
                  <FacebookIcon className={classes.icon} />
                </a>
              )
            );
          case "twitter":
            return (
              s.url && (
                <a
                  key={`twitter${index}`}
                  className={clsx(classes.link, classes.twitter)}
                  href={s.url}
                  target="_blank"
                  title="Twitter"
                  rel="noreferrer"
                >
                  <TwitterIcon className={classes.icon} />
                </a>
              )
            );
          case "telegram":
            return (
              s.url && (
                <a
                  key={`telegram${index}`}
                  className={clsx(classes.link, classes.telegram)}
                  href={s.url}
                  target="_blank"
                  title="Telegram"
                  rel="noreferrer"
                >
                  <TelegramIcon className={classes.icon} />
                </a>
              )
            );
          case "reddit":
            return (
              s.url && (
                <a
                  key={`reddit${index}`}
                  className={clsx(classes.link, classes.reddit)}
                  href={s.url}
                  target="_blank"
                  title="Reddit"
                  rel="noreferrer"
                >
                  <RedditIcon className={classes.icon} />
                </a>
              )
            );
          case "bitcointalk":
            return (
              s.url && (
                <a
                  key={`reddit${index}`}
                  className={clsx(classes.link, classes.bitcointalk)}
                  href={s.url}
                  target="_blank"
                  title="BitcoinTalk"
                  rel="noreferrer"
                >
                  <BitcoinTalkIcon className={classes.icon} />
                </a>
              )
            );
        }
      })}
    </div>
  );
}
