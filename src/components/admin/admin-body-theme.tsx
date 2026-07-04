"use client";

import { useEffect } from "react";

export function AdminBodyTheme() {
  useEffect(() => {
    document.body.classList.add("bg-zinc-950", "text-zinc-100");
    document.body.classList.remove("bg-zinc-50", "text-zinc-900");

    return () => {
      document.body.classList.remove("bg-zinc-950", "text-zinc-100");
      document.body.classList.add("bg-zinc-50", "text-zinc-900");
    };
  }, []);

  return null;
}
