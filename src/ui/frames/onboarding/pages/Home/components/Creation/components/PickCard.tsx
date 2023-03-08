import { useNavigate } from "react-router-dom";

import { Box, CardActionArea, List, ListItem, Stack, styled, Typography } from "@mui/material";

import { Icon } from "ui/frames/onboarding/components/Icon";

const Root = styled(Stack)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.primary900,
    transition: theme.transitions.create(["background-color"]),
  },
  "&:hover [id='important']": {
    backgroundColor: theme.palette.bg100,
    transition: theme.transitions.create(["background-color"]),
  },
  "&:hover [id='important'] span": {
    color: theme.palette.txt900,
    transition: theme.transitions.create(["color"]),
  },
}));

const CardArea = styled(CardActionArea)(() => ({
  borderRadius: "16px",
}));

export interface PickCardProps {
  items: string[];
  title: string;
  onClick: () => void;
  additionInfo: string;
}

export const PickCard = (props: PickCardProps) => {
  const { items, title, additionInfo, onClick } = props;

  return (
    <CardArea onClick={onClick}>
      <Root border="1px solid" borderColor="outline700" borderRadius="16px" height="100%" justifyContent="space-between" p={3} width="100%">
        <div>
          <Stack direction="row" gap="16px" justifyContent="space-between" mb={2}>
            <Typography component="h3" variant="h200-xl">
              {title}
            </Typography>
            <Icon name="24px-arrow-right-long" />
          </Stack>
          <List>
            {items.map((text, index) => (
              <ListItem
                key={text}
                sx={{
                  p: 0,
                  mb: 1,
                }}
              >
                <Typography color="primary900" variant="p400-xl" mr={1}>
                  {index + 1}.
                </Typography>
                <Typography variant="p400-xl">{text}</Typography>
              </ListItem>
            ))}
          </List>
        </div>
        <Box bgcolor="bg800" borderRadius="8px" id="important" p={2}>
          <Typography color="txt600" variant="p400-xl">
            <Typography color="txt100" component="span" variant="p400-xl">
              Important:{" "}
            </Typography>
            {additionInfo}
          </Typography>
        </Box>
      </Root>
    </CardArea>
  );
};
