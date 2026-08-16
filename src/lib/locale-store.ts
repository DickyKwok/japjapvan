import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "zh" | "ja";

export const LOCALES: Array<{ id: Locale; short: string; native: string; html: string }> = [
  { id: "en", short: "EN", native: "English", html: "en" },
  { id: "zh", short: "中文", native: "繁體中文", html: "zh-Hant" },
  { id: "ja", short: "日本語", native: "日本語", html: "ja" },
];

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => {
        set({ locale });
        if (typeof document !== "undefined") {
          const meta = LOCALES.find((l) => l.id === locale);
          document.documentElement.lang = meta?.html ?? "en";
        }
      },
    }),
    { name: "japjapvan-locale" },
  ),
);

export function getLocale(): Locale {
  if (typeof window === "undefined") return "en";
  return useLocaleStore.getState().locale;
}
