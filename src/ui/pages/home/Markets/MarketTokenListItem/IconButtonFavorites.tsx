import { MouseEvent } from "react";

import { IconButton, ListItemIcon } from "@mui/material";
import { StarBorder as StarBorderIcon, Star as StarIcon } from "@mui/icons-material";

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

  const [isFavorite, setIsFavorite] = useAssetFavoriteState(assetId);

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();

    setIsFavorite(value => !value);
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
