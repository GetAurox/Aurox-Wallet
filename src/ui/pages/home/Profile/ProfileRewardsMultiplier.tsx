import { Fragment } from "react";
import reactStringReplace from "react-string-replace";

import { Divider, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";

import { defaultTheme } from "ui/common/theme";
import { MULTIPLIER_DATA } from "ui/common/rewardSystem";

import { boldTextRegexp } from "./helpers";

import ProfileSection from "./ProfileSection";

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

export interface ProfileRewardsMultiplierProps {
  isLocked?: boolean;
}

export default function ProfileRewardsMultiplier(props: ProfileRewardsMultiplierProps) {
  const { isLocked } = props;

  const lockedColor = defaultTheme.palette.custom.grey[30];

  return (
    <ProfileSection title="Aurox Token Multiplier">
      <List disablePadding sx={sxStyles.list}>
        {MULTIPLIER_DATA.map(({ Icon, IconGray, title, content }, index) => (
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
            {index !== MULTIPLIER_DATA.length - 1 && <Divider component="li" />}
          </Fragment>
        ))}
      </List>
    </ProfileSection>
  );
}
