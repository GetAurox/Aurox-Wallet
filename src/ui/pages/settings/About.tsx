import { useHistoryGoBack } from "ui/common/history";

import DescriptionItem, { DescriptionItemVariant } from "ui/components/common/DescriptionListItem";
import DescriptionList from "ui/components/common/DescriptionList";
import Header from "ui/components/layout/misc/Header";

const aboutConfig = [
  { label: "Company Name", value: "Aurox Holdings Inc." },
  { label: "Website", value: "getaurox.com", variant: "link" },
  { label: "Support Email", value: "support@getaurox.com", variant: "copyable" },
  { label: "Documentation", value: "help.getaurox.com", variant: "link" },
  { label: "Twitter", value: "twitter.com/getaurox", variant: "link" },
  { label: "Version Information", value: "1.0.5" },
  { label: "Privacy Policy", value: "getaurox.com/privacy", variant: "link" },
  { label: "Terms of Service", value: "getaurox.com/tos", variant: "link" },
];

export default function About() {
  const goBack = useHistoryGoBack();

  return (
    <>
      <Header title="About" onBackClick={goBack} />
      <DescriptionList rowGap={1.5} mx={2} mt="13px">
        {aboutConfig.map(({ label, value, variant }, index) => {
          return <DescriptionItem key={index} label={label} value={value} variant={variant as DescriptionItemVariant} />;
        })}
      </DescriptionList>
    </>
  );
}
