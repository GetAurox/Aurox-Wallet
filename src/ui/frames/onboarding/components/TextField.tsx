import { ComponentProps, JSXElementConstructor, ReactNode } from "react";

import { FormControl, InputProps } from "@mui/material";

import { FieldError } from "./FieldError";
import { Input } from "./Input";

type TextFieldProps<RC extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> = InputProps & {
  renderCaption?: RC;
  renderCaptionProps?: ComponentProps<RC>;
  min?: string;
  meta?: any;
  disabled?: boolean;
  caption?: ReactNode;
};

export function TextField({ renderCaption: CustomCaption, renderCaptionProps, caption, error, meta, ...props }: TextFieldProps<any>) {
  return (
    <FormControl variant="standard" {...(props as any)}>
      <Input {...props} />
      {CustomCaption ? (
        <CustomCaption {...renderCaptionProps} error={error} meta={meta} value={props.value} />
      ) : (
        (caption || !!error) && <FieldError>{error || caption}</FieldError>
      )}
    </FormControl>
  );
}
