import { styled, Box, BoxProps, Stack, Typography, LinearProgress, LinearProgressProps, linearProgressClasses } from "@mui/material";
import { keyframes } from "@mui/system";

import { useRegistrationProgressContext } from "ui/frames/onboarding/context";

import { Icon } from "./Icon";

const pulsate = keyframes`
  0%: { transform: scale(1); }
  25% { transform: scale(1.15); }
  50% { transform: scale(1.35); }
  75% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

const blink = keyframes`
  0%: { opacity: 1; }
  25% { opacity: .75; }
  50% { opacity: .55; }
  75% { opacity: .75; }
  100% { opacity: 1; }
`;

const BorderLinearProgress = styled(({ blinking = false, ...rest }: LinearProgressProps & { blinking?: boolean }) => (
  <LinearProgress {...rest} />
))(({ blinking, theme }) => ({
  height: 2,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    // backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    backgroundColor: theme.palette.bg850,
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    background: "linear-gradient(90deg, #184EFF 0%, #18F1FF 100%) !important",
  },
  animation: blinking ? `${blink} infinite 2s linear` : undefined,
}));

const Dot = ({ value, pulsating = false }: { value: number; pulsating?: boolean }) => {
  const commonProps: BoxProps = {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    m: "auto",
    bgcolor: "#18F1FF",
    borderRadius: "100%",
  };

  return (
    <Box position="relative" sx={{ transform: `translateX(${value - 1}%)`, transition: "transform .4s linear" }} zIndex={2}>
      <Box height={8} position="absolute" top={-3} width={8} zIndex={2}>
        <Box
          {...commonProps}
          height={2}
          sx={{ filter: "blur(1px)", animation: pulsating ? `${pulsate} infinite 1s linear` : undefined }}
          width={2}
        />
        <Box
          {...commonProps}
          height={4}
          sx={{ filter: "blur(2px)", animation: pulsating ? `${pulsate} infinite 1s linear` : undefined }}
          width={4}
        />
        <Box
          {...commonProps}
          height={8}
          sx={{ filter: "blur(4px)", animation: pulsating ? `${pulsate} infinite 1s linear` : undefined }}
          width={8}
        />
      </Box>
    </Box>
  );
};

export function ProgressRegistration() {
  const { progress } = useRegistrationProgressContext();
  const { totalPoints, action, getPoints, percent } = progress;

  return (
    <Box overflow="hidden" width="100%">
      <Stack direction="row" justifyContent="space-between" mb="6px">
        <Typography variant="p400-xl">LVL 0</Typography>
        <Typography variant="p400-xl">LVL 1</Typography>
      </Stack>
      <Box position="relative">
        <Dot value={percent} pulsating={percent < 100} />
        <BorderLinearProgress value={percent} variant="determinate" blinking={percent < 100} />
      </Box>
      <Stack alignItems="center" direction="row" justifyContent="space-between" mt={2}>
        {action && (
          <Stack alignItems="center" color="primary900" direction="row" spacing={1}>
            <Icon name="16px-warning" size="small" />
            <Typography color="txt300" variant="p400-lg">
              {action} and get {getPoints} points
            </Typography>
          </Stack>
        )}
        <Box bgcolor="bg850" borderRadius="48px" px={2} py={1} ml="auto">
          <Typography color="txt300" variant="p400-lg">
            Points {totalPoints}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
