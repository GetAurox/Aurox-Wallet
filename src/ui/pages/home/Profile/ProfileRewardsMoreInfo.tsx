import { MouseEvent } from "react";

import { List } from "@mui/material";

import { IconArrow } from "ui/components/icons";
import CommonListItem from "ui/components/common/CommonListItem";

import { MORE_INFO_LINKS } from "ui/common/rewardSystem";

import ProfileSection from "./ProfileSection";

const sxStyles = {
  commonListItem: {
    listItemText: {
      ml: 2,
    },
  },
};

export default function ProfileRewardsMoreInfo() {
  const handleOnClick = (url: string) => (event: MouseEvent) => {
    event.preventDefault();

    window.open(url);
  };

  return (
    <ProfileSection title="More Info">
      <List disablePadding>
        {MORE_INFO_LINKS.map((link, index) => (
          <CommonListItem
            key={index}
            endIcon={<IconArrow />}
            primaryLabel={link.title}
            sx={sxStyles.commonListItem}
            onClick={handleOnClick(link.url)}
          />
        ))}
      </List>
    </ProfileSection>
  );
}
