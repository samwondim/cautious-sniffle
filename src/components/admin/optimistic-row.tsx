"use client";

import { createContext, useContext, useMemo, useState } from "react";

/**
 * Lets a row's controls hide the row while a destructive action is in flight,
 * so a delete feels instant instead of waiting on the server.
 *
 * The row stays mounted (`display: none`, not unmounted) on purpose: if the
 * action fails, the control that hid it is still rendered and can reveal it
 * again. Unmounting would take the control with it, leaving no way to roll
 * back without a full refresh.
 */

type RowControl = {
  setPendingRemoval: (pending: boolean) => void;
};

const RowContext = createContext<RowControl | null>(null);

export function usePendingRemoval(): RowControl {
  const value = useContext(RowContext);
  if (!value) {
    throw new Error("usePendingRemoval must be used within <OptimisticRow>");
  }
  return value;
}

function useRowControl() {
  const [pendingRemoval, setPendingRemoval] = useState(false);
  const value = useMemo<RowControl>(
    () => ({ setPendingRemoval }),
    [setPendingRemoval],
  );
  return { pendingRemoval, value };
}

export function OptimisticTableRow({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { pendingRemoval, value } = useRowControl();
  return (
    <tr className={`${className} ${pendingRemoval ? "hidden" : ""}`.trim()}>
      <RowContext.Provider value={value}>{children}</RowContext.Provider>
    </tr>
  );
}

export function OptimisticCardRow({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { pendingRemoval, value } = useRowControl();
  return (
    <li className={`${className} ${pendingRemoval ? "hidden" : ""}`.trim()}>
      <RowContext.Provider value={value}>{children}</RowContext.Provider>
    </li>
  );
}
