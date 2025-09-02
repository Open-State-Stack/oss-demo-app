export const LOCALES = [
  {
    value: "en",
    full_value: ["en-us", "en"],
    label: "English",
  },
  {
    value: "gr",
    full_value: ["gr", "el"],
    label: "Greek",
  },
] as const;

export const getShortLocale = (locale: string) => {
  const index = LOCALES.findIndex((l) =>
    l.full_value.some((v) => v === locale)
  );
  return index !== -1 ? LOCALES[index].value : "en";
};
