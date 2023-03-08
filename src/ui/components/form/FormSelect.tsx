import { ReactNode, useMemo } from "react";
import clsx from "clsx";

import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";

import { Paper, FormHelperText, Select, SelectProps, MenuItemProps, MenuItem } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  label: {
    marginBottom: 7,
    fontSize: 14,
    lineHeight: 20 / 14,
    letterSpacing: theme.typography.pxToRem(0.25),
    color: theme.palette.text.primary,
  },
  labelError: {
    color: theme.palette.error.main,
  },
  selectWrap: {
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.custom.grey["19"],
    borderRadius: 12,
    border: `1px solid ${theme.palette.custom.grey["19"]}`,

    "&:focus-within": {
      borderColor: theme.palette.primary.main,
    },
  },
  selectWrapError: {
    borderColor: theme.palette.error.main,

    "&:focus-within": {
      borderColor: theme.palette.error.main,
    },
  },
  select: {
    "&.MuiInputBase-root": {
      flex: 1,
      padding: 0,
      borderRadius: 12,
    },

    "& > .MuiSelect-select": {
      minHeight: "unset",
      padding: "10px 12px",
      borderRadius: 12,
    },

    "& > .MuiOutlinedInput-notchedOutline": {
      display: "none",
    },
  },
  helper: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 16 / 12,
    letterSpacing: theme.typography.pxToRem(0.4),
    color: theme.palette.text.secondary,
  },
}));

export type SelectItem = MenuItemProps & { label: ReactNode };

export interface FormSelectProps extends SelectProps {
  items: SelectItem[];
  label?: ReactNode;
  helper?: ReactNode;
  placeholder?: string;
  rootClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  helperClassName?: string;
  selectWrapClassName?: string;
}

export default function FormSelect(props: FormSelectProps) {
  const { items, label, helper, error, rootClassName, labelClassName, selectClassName, helperClassName, selectWrapClassName, ...rest } =
    props;

  const classes = useStyles();

  const id = useMemo(() => Math.round(Math.random() * 1e6), []);

  return (
    <div className={clsx(classes.root, rootClassName)}>
      {label && (
        <label htmlFor={`select_${id}`} className={clsx(classes.label, { [classes.labelError]: error }, labelClassName)}>
          {label}
        </label>
      )}
      <Paper
        className={clsx(classes.selectWrap, selectWrapClassName, {
          [classes.selectWrapError]: error,
        })}
      >
        <Select id={`select_${id}`} aria-describedby={`helper_${id}`} className={clsx(classes.select, selectClassName)} {...rest}>
          {items.map((item, index) => (
            <MenuItem key={`${item.value}_${index}`} {...item}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </Paper>
      {helper && (
        <FormHelperText id={`helper_${id}`} className={clsx(classes.helper, helperClassName)}>
          {helper}
        </FormHelperText>
      )}
    </div>
  );
}
