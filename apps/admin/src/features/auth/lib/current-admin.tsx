"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { currentAdminApi } from "../api/current-admin";
import type { CurrentAdmin } from "../types";
import { currentAdminErrorMessage } from "./current-admin-error";

type CurrentAdminState = Readonly<{
  admin?: CurrentAdmin;
  error?: string;
  loading: boolean;
  retry: () => void;
}>;

const CurrentAdminContext = createContext<CurrentAdminState | undefined>(undefined);

export function CurrentAdminProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [admin, setAdmin] = useState<CurrentAdmin>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [requestVersion, setRequestVersion] = useState(0);

  const retry = useCallback(() => {
    setLoading(true);
    setError(undefined);
    setRequestVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    currentAdminApi
      .get(controller.signal)
      .then((nextAdmin) => {
        if (!controller.signal.aborted) setAdmin(nextAdmin);
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setAdmin(undefined);
          setError(currentAdminErrorMessage(caught));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [requestVersion]);

  const value = useMemo(
    () => ({ admin, error, loading, retry }),
    [admin, error, loading, retry],
  );

  return <CurrentAdminContext.Provider value={value}>{children}</CurrentAdminContext.Provider>;
}

export function useCurrentAdmin(): CurrentAdminState {
  const value = useContext(CurrentAdminContext);
  if (!value) throw new Error("useCurrentAdmin must be used within CurrentAdminProvider.");
  return value;
}
