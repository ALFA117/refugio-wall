"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

// Shared language state: English default, remembered in localStorage, mirrored to <html lang>.
// Used by the Wall and the guardian profile so the choice carries across pages.
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("refugio-lang");
    if (saved === "en" || saved === "es") setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("refugio-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return [lang, setLang];
}
