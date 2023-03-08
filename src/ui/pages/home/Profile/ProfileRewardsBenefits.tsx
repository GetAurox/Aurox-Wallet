import { Fragment } from "react";

import { Divider, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";

import { defaultTheme } from "ui/common/theme";

import { LevelIdentity, BENEFITS_DATA } from "ui/common/rewardSystem";

import Section from "./ProfileSection";

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
  avatar: {
    width: 24,
    height: 24,
  },
  divider: {
    ml: 4.5,
  },
};

export interface ProfileRewardsBenefitsProps {
  activeLevelIdentity: LevelIdentity;
  isLocked?: boolean;
}

export default function ProfileRewardsBenefits(props: ProfileRewardsBenefitsProps) {
  const { activeLevelIdentity, isLocked } = props;

  const lockedColor = defaultTheme.palette.custom.grey[30];
  const activeLevelBenefits = BENEFITS_DATA.filter(benefit => benefit.level.includes(activeLevelIdentity));

  if (activeLevelBenefits.length === 0) {
    return <></>;
  }

  return (
    <Section isLocked={isLocked} title="Benefits of This Level">
      <List disablePadding sx={sxStyles.list}>
        {activeLevelBenefits.map(({ Icon, IconGray, title }, index) => (
          <Fragment key={index}>
            <ListItem sx={sxStyles.listItem} disablePadding alignItems="flex-start">
              <ListItemIcon sx={sxStyles.listItemIcon}>{isLocked ? <IconGray /> : <Icon />}</ListItemIcon>
              <ListItemText
                disableTypography
                primary={
                  <Typography variant="large" color={isLocked ? lockedColor : undefined} fontWeight={500}>
                    {title}
                  </Typography>
                }
              />
            </ListItem>
            {index !== activeLevelBenefits.length - 1 && <Divider sx={sxStyles.divider} variant="inset" component="li" />}
          </Fragment>
        ))}
      </List>
    </Section>
  );
}
