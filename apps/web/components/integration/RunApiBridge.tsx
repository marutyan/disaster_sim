"use client";

import { useEffect, useState } from "react";

import { registerRemoteRun } from "../../lib/api";
import { loadStoredSetup } from "../../lib/storage";

export function RunApiBridge() {
  const [status, setStatus] = useState("API run registration: checking");

  useEffect(() => {
    const setup = loadStoredSetup(window.localStorage);
    if (!setup) {
      setStatus("API run registration: no local setup");
      return;
    }
    let cancelled = false;
    registerRemoteRun(setup)
      .then((registration) => {
        if (!cancelled) {
          setStatus(`API run registered: ${registration.runId}`);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("API unavailable: local deterministic simulation continues");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <span className="integration-status" aria-live="polite">{status}</span>;
}
