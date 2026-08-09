"use client";

import { useEffect, useState } from "react";

import { submitRemoteReview } from "../../lib/api";
import { loadStoredReview } from "../../lib/review-storage";

export function ReviewApiBridge() {
  const [status, setStatus] = useState("API review: checking");

  useEffect(() => {
    const review = loadStoredReview(window.sessionStorage);
    if (!review) {
      setStatus("API review: no local run");
      return;
    }
    let cancelled = false;
    submitRemoteReview(review)
      .then((result) => {
        if (!cancelled) {
          setStatus(
            `API review: ${result.hazardStatus} / ${result.simulatedOutcome}`,
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("API unavailable: local review remains available");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <span className="integration-status" aria-live="polite">{status}</span>;
}
