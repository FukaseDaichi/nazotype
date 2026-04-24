"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  clearSecretShareEntry,
  readSecretShareEntry,
} from "@/lib/secret-result";

const SecretShareAvailabilityContext = createContext(false);

type SecretShareAvailabilityProviderProps = {
  children: ReactNode;
};

export function SecretShareAvailabilityProvider({
  children,
}: SecretShareAvailabilityProviderProps) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const nextCanShare = readSecretShareEntry();
      setCanShare(nextCanShare);

      if (nextCanShare) {
        // 初回表示後に一度だけ消費し、共有リンクの再訪では共有導線を出さない。
        clearSecretShareEntry();
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <SecretShareAvailabilityContext.Provider value={canShare}>
      {children}
    </SecretShareAvailabilityContext.Provider>
  );
}

export function useSecretShareAvailability() {
  return useContext(SecretShareAvailabilityContext);
}
