import type { ReactNode } from "react";

import { RunApiBridge } from "../../components/integration/RunApiBridge";

export default function SimulateLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <RunApiBridge />
      {children}
    </>
  );
}
