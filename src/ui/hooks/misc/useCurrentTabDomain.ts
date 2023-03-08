import { useEffect, useState } from "react";

import { getCurrentTabHostname, getDomainFromHostname } from "common/chrome";

export function useCurrentTabDomain() {
  const [domain, setDomain] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const tabHostname = await getCurrentTabHostname();

        if (mounted) {
          const domain = getDomainFromHostname(tabHostname);

          setDomain(domain);
        }
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return domain;
}
