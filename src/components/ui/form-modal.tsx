"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { modalActionsClass } from "@/lib/admin/ui-classes";

export function FormModal({
  open,
  onClose,
  title,
  children,
  titleId = "form-modal-title",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  titleId?: string;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="Mbyll"
        className="absolute inset-0 cursor-pointer bg-zinc-950/70 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(92dvh,calc(100dvh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4">
          <h3 id={titleId} className="text-base font-semibold text-zinc-100">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Mbyll"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function ModalActions({ children }: { children: ReactNode }) {
  return <div className={modalActionsClass}>{children}</div>;
}
