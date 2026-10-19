import type { ReactNode } from "react";
import { RouteReady } from "@/components/layout/RouteTransition";

export default function Template({ children }: { children: ReactNode }) {
  return <>{children}<RouteReady/></>;
}
