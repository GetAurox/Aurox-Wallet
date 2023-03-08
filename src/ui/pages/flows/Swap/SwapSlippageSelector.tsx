import { ChangeEvent } from "react";

import { styled, Button, buttonClasses, IconButton, iconButtonClasses, Stack, StackProps, inputBaseClasses } from "@mui/material";

import { TokenSwapSlippageTolerance } from "common/types";

import FormField from "ui/components/form/FormField";

import { IconClose } from "ui/components/icons";

const SlippageButton = styled(Button)({
  [`&.${buttonClasses.root}`]: {
    minWidth: 0,
    padding: 8,
    borderRadius: 4,
  },
});

const CloseButton = styled(IconButton)({
  [`&.${iconButtonClasses.root}`]: {
    padding: 0,
  },
});

const sxStyles = {
  formField: {
    inputBase: {
      [`&.${inputBaseClasses.root}`]: {
        fontSize: 14,
        lineHeight: 20 / 14,
        letterSpacing: "0.25px",
      },
      [`& .${inputBaseClasses.input}`]: {
        height: 20,
      },
    },
  },
};

export interface SwapSlippageSelectorProps extends Omit<StackProps, "onChange"> {
  slippage: TokenSwapSlippageTolerance;
  onChange: (value: TokenSwapSlippageTolerance) => void;
  error?: boolean;
}

export default function SwapSlippageSelector(props: SwapSlippageSelectorProps) {
  const { slippage, onChange, error, ...rest } = props;

  const createSelectSlippageHandle = (value: TokenSwapSlippageTolerance) => () => {
    onChange(value);
  };

  const handleChangeCustomSlippage = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);

    onChange({ custom: newValue });
  };

  const isCustom = typeof slippage === "object" && "custom" in slippage;

  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} {...rest}>
      {isCustom ? (
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
          <FormField
            type="number"
            error={error}
            autoComplete="off"
            name="customSlippage"
            value={slippage.custom}
            sx={sxStyles.formField}
            inputProps={{ step: 0.1, max: 100 }}
            onChange={handleChangeCustomSlippage}
          />
          <CloseButton disableRipple onClick={createSelectSlippageHandle("auto")}>
            <IconClose />
          </CloseButton>
        </Stack>
      ) : (
        <>
          <SlippageButton size="small" variant={slippage === 0.2 ? "contained" : "text"} onClick={createSelectSlippageHandle(0.2)}>
            0.2%
          </SlippageButton>
          <SlippageButton size="small" variant={slippage === 0.3 ? "contained" : "text"} onClick={createSelectSlippageHandle(0.3)}>
            0.3%
          </SlippageButton>
          <SlippageButton size="small" variant={slippage === "auto" ? "contained" : "text"} onClick={createSelectSlippageHandle("auto")}>
            Auto
          </SlippageButton>
          <SlippageButton size="small" variant="text" onClick={createSelectSlippageHandle({ custom: undefined })}>
            Custom
          </SlippageButton>
        </>
      )}
    </Stack>
  );
}
