import { Fragment } from "react";
import reactStringReplace from "react-string-replace";

import { Divider, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";

import { defaultTheme } from "ui/common/theme";

import { POINTS_DATA } from "ui/common/rewardSystem";

import Section from "./ProfileSection";

const boldTextRegexp = /\[\/?(?:b){1,}.*?]/gim;

const sxStyles = {
  list: {
    ml: 2,
  },
  listItem: {
    py: 2,
  },
  listItemIcon: {
    m: 0,
    minWidth: 36,
  },
};

export interface ProfileRewardsPointsProps {
  isLocked?: boolean;
}

export default function ProfileRewardsPoints(props: ProfileRewardsPointsProps) {
  const { isLocked } = props;

  const lockedColor = defaultTheme.palette.custom.grey[30];

  return (
    <Section isLocked={isLocked} title="How to Earn Points">
      <List disablePadding sx={sxStyles.list}>
        {POINTS_DATA.map(({ Icon, IconGray, title, content }, index) => (
          <Fragment key={index}>
            <ListItem sx={sxStyles.listItem} disablePadding alignItems="flex-start">
              <ListItemIcon sx={sxStyles.listItemIcon}>{isLocked ? <IconGray /> : <Icon />}</ListItemIcon>
              <ListItemText
                disableTypography
                primary={
                  <Typography variant="large" component="h3" fontWeight={500} color={isLocked ? lockedColor : undefined}>
                    {title}
                  </Typography>
                }
                secondary={
                  <List component="ul" disablePadding>
                    {content.map((text, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText
                          disableTypography
                          primary={
                            <Typography
                              variant="medium"
                              fontWeight={isLocked ? 500 : 400}
                              color={isLocked ? lockedColor : "text.secondary"}
                            >
                              {"- "}
                              {reactStringReplace(text, boldTextRegexp, (match, index) => (
                                <Typography
                                  variant="medium"
                                  component="span"
                                  fontWeight={500}
                                  color={isLocked ? lockedColor : "text.primary"}
                                  key={index}
                                >
                                  {match}
                                </Typography>
                              ))}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                }
              />
            </ListItem>
            {index !== POINTS_DATA.length - 1 && <Divider component="li" />}
          </Fragment>
        ))}
      </List>
    </Section>
  );
}
