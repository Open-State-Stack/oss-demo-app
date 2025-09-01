"use client";
import { useState, type FC } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { LOCALES } from "@/lib/locales";
import { Button } from "../../ui/button";
import { ChevronDown } from "lucide-react";

interface LanguageSwitcherProps {
  onLanguageChange?: (lang: string) => void;
  variant?: "dark" | "light";
}

type SelectedLanguageTypes = (typeof LOCALES)[number] | null;

export const LanguageSwitcher: FC<LanguageSwitcherProps> = ({
  onLanguageChange,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ lang: string }>();
  const [selectedLanguage, setSelectedLanguage] =
    useState<SelectedLanguageTypes>(
      LOCALES.find((locale) => locale.value === params.lang) || null
    );

  const handleLanguageChange = (lang: string) => {
    const newLocale = LOCALES.find((locale) => locale.value === lang);
    if (newLocale) setSelectedLanguage(newLocale);
    const newPath = pathname.replace(/^\/[^/]+/, `/${lang}`);
    router.push(newPath);
    if (onLanguageChange) onLanguageChange(lang);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="shadow-none">
            {selectedLanguage?.label}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuRadioGroup
            value={selectedLanguage?.value}
            onValueChange={handleLanguageChange}
          >
            {LOCALES.map((locale) => (
              <DropdownMenuRadioItem
                key={locale.value}
                value={locale.value}
                className="cursor-pointer w-full !bg-white"
                onClick={() => handleLanguageChange(locale.value)}
              >
                {locale.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
