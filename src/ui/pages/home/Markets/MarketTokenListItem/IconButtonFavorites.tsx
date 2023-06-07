import { MouseEvent } from "react";

import { IconButton, ListItemIcon } from "@mui/material";
import { StarBorder as StarBorderIcon, Star as StarIcon } from "@mui/icons-material";

import useAnalytics from "ui/common/analytics";
import { EasterEgg } from "ui/common/rewardSystem";

import { useAssetFavoriteState } from "ui/hooks";

const sxStyles = {
  blinker: {
    top: 8,
    right: 2,
  },
};

export interface IconButtonFavoritesProps {
  assetId?: number;
}

export default function IconButtonFavorites(props: IconButtonFavoritesProps) {
  const { assetId } = props;

  const { trackButtonClicked } = useAnalytics();

  const [isFavorite, setIsFavorite] = useAssetFavoriteState(assetId);

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();

    setIsFavorite(value => !value);

    trackButtonClicked("Market Token Favorite");
  };

  return (
    <ListItemIcon>
      <IconButton onClick={handleClick}>
        {isFavorite ? (
          <StarIcon color="primary" />
        ) : (
          <EasterEgg campaignId="coin_favorited" blinkerSx={sxStyles.blinker}>
            <StarBorderIcon />
          </EasterEgg>
        )}
      </IconButton>
    </ListItemIcon>
  );
}
