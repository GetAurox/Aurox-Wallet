import { Stack } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function RouteTransitionRoot() {
  return (
    <Stack position="absolute" top={0} left={0} right={0} bottom={0}>
      <Outlet />
    </Stack>
  );
}
