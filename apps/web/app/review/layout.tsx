import type { ReactNode } from "react";

import { ReviewApiBridge } from "../../components/integration/ReviewApiBridge";

export default function ReviewLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ReviewApiBridge />
      {children}
    </>
  );
}
