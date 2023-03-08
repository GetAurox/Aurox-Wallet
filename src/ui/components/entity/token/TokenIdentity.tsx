import { Stack, StackProps, Typography, TypographyProps } from "@mui/material";

import TokenAvatar from "ui/components/common/TokenAvatar";
import { customPalette } from "ui/common/theme";

export type TokenIdentityPrimaryVariant = "small" | "medium" | "large";
export type TokenIdentityIconVariant = TokenIdentityPrimaryVariant | "x-large";

export interface TokenIdentityProps extends StackProps {
  networkIdentifier?: string;
  primary: string;
  /**
   * @small
   * ```
   * {
   *   fontWeight: 400;
   *   fontSize: 14px;
   *   lineHeight: 20px;
   *   letterSpacing: 0.25px
   * }
   * ```
   * @medium
   * ```
   * {
   *  fontWeight: 500;
   *  fontSize: 16px;
   *  lineHeight: 24px;
   *  letterSpacing: 0.5px;
   * }
   * ```
   * @large
   * ```
   * {
   *  fontWeight: 500;
   *  fontSize: 20px;
   *  lineHeight: 24px;
   *  letterSpacing: 0.15px;
   * }
   * ```
   */
  primaryVariant?: TokenIdentityPrimaryVariant;
  secondary?: string;
  disabled?: boolean;
  src?: string;
  alt?: string;
  /**
   * @small 16px
   * @medium 24px
   * @large 32px
   * @x-large 36px
   */
  iconVariant?: TokenIdentityIconVariant;
}

const iconScale: Record<TokenIdentityIconVariant, number> = {
  "x-large": 36,
  large: 32,
  medium: 24,
  small: 16,
};

const badgeScale: Record<TokenIdentityIconVariant, number> = {
  "x-large": 16,
  large: 14,
  medium: 12,
  small: 10,
};

const getSize = (variant: TokenIdentityIconVariant = "medium", entity: "icon" | "badge" = "icon") => {
  return entity === "icon" ? iconScale[variant] : badgeScale[variant];
};

const getPrimaryRender = (text: string, variant: TokenIdentityPrimaryVariant = "small", color?: string) => {
  const props: TypographyProps = {
    color,
    sx: { maxWidth: 150, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
  };

  return variant === "small" ? (
    <Typography variant="medium" {...props}>
      {text}
    </Typography>
  ) : variant === "medium" ? (
    <Typography variant="large" {...props} fontWeight={500}>
      {text}
    </Typography>
  ) : (
    <Typography variant="headingSmall">{text}</Typography>
  );
};

const getSecondaryRender = (text?: string, color?: string) =>
  text ? (
    <Typography variant="small" color={color}>
      {text}
    </Typography>
  ) : null;

export default function TokenIdentity(props: TokenIdentityProps) {
  const { primary, primaryVariant = "small", secondary, disabled, src, alt, iconVariant = "medium", networkIdentifier, ...rest } = props;

  const primaryRender = getPrimaryRender(primary, primaryVariant, disabled ? customPalette.grey["50"] : "inherit");
  const secondaryRender = getSecondaryRender(secondary, disabled ? customPalette.grey["50"] : "inherit");

  let textRender = primaryRender;

  if (secondaryRender) {
    textRender = (
      <Stack spacing={0.25}>
        {primaryRender}
        {secondaryRender}
      </Stack>
    );
  }

  return (
    <Stack direction="row" alignItems="center" {...rest}>
      <TokenAvatar
        src={src}
        alt={alt}
        tokenIconSize={getSize(iconVariant)}
        networkIdentifier={networkIdentifier}
        networkIconSize={getSize(iconVariant, "badge")}
      />
      {textRender}
    </Stack>
  );
}
