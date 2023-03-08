import { ComponentType, memo, Suspense } from "react";

export interface LazyRouteProps {
  Route: ComponentType<any>;
}

export default memo(function LazyRoute(props: LazyRouteProps) {
  const { Route } = props;

  return (
    <Suspense fallback={null}>
      <Route />
    </Suspense>
  );
});
