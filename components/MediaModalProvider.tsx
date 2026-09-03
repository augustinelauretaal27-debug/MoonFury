"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Content } from "@/data/movies";
import { MediaModal } from "@/components/MediaModal";

type ModalContextValue = {
  open: (item: Content) => void;
  close: () => void;
};

const ModalContext = createContext<ModalContextValue>({
  open: () => {},
  close: () => {},
});

export function useMediaModal() {
  return useContext(ModalContext);
}

export function MediaModalProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<Content | null>(null);

  const open = useCallback((content: Content) => setItem(content), []);
  const close = useCallback(() => setItem(null), []);

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      {item && <MediaModal item={item} onClose={close} />}
    </ModalContext.Provider>
  );
}
