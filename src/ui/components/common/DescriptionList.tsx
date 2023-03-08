import { Children } from "react";

import { Stack, StackProps } from "@mui/material";

import DescriptionListItem from "./DescriptionListItem";

export type DescriptionListProps = StackProps;

export default function DescriptionList(props: DescriptionListProps) {
  const { children, ...stackProps } = props;

  return (
    <Stack component="dl" {...(stackProps as StackProps<"dl", { component?: "dl" }>)}>
      {children}
    </Stack>
  );
}

DescriptionList.propTypes = {
  children: function (props: Record<string, any>, propName: string, componentName: string) {
    const children = props[propName];

    Children.forEach(children, function (child) {
      if (child.type.name !== DescriptionListItem.name) {
        console.error("`" + componentName + "` children should be of type `DescriptionListItem`.");
      }
    });
  },
};
