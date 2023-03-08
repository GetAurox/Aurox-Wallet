import { useEffect, useState } from "react";

export interface DelayedProps {
  children: JSX.Element;
  delay?: number;
}

export default function Delayed({ children, delay = 500 }: DelayedProps) {
  const [render, setRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRender(true), delay);

    return () => clearTimeout(timer);
  });

  return render ? children : <></>;
}
