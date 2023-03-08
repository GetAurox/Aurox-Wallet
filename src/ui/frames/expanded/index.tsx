import "common/bootstrap";

import "ui/common/mock";

import { memo } from "react";
import { render } from "react-dom";

import Root from "ui/components/common/Root";

const App = memo(function App() {
  return <>Expanded View</>;
});

render(<Root App={App} />, document.getElementById("app"));

if ((module as any).hot) {
  (module as any).hot.accept();
}
