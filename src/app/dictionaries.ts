import { TranslationsTypes } from "@/types/translations";
export type LocaleKeys = "en" | "gr";

import enAuth from "../../public/locales/en/authentication.json";
import enCommon from "../../public/locales/en/common.json";
import enLanding from "../../public/locales/en/landing.json";


import grAuth from "../../public/locales/gr/authentication.json";
import grCommon from "../../public/locales/gr/common.json";
import grLanding from "../../public/locales/gr/landing.json";

type TranslationFiles = "authentication" | "common" | "landing";

const translations = {
  en: {
    authentication: enAuth,
    common: enCommon,
    landing: enLanding,
  },
  gr: {
    authentication: grAuth,
    common: grCommon,
    landing: grLanding
  },
} as const;

function getDictionary<T extends readonly (keyof TranslationsTypes)[]>(
  locale: LocaleKeys,
  files: [...T]
): { [K in T[number]]: TranslationsTypes[K] } {
  const result: { [key: string]: unknown } = {};

  files.forEach((file) => {
    result[file] =
      translations[locale][file as TranslationFiles] ||
      translations["en"][file as TranslationFiles];
  });

  return result as { [K in T[number]]: TranslationsTypes[K] };
}

export { getDictionary };
