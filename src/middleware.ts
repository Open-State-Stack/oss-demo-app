import { NextResponse, NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { LOCALES, getShortLocale } from "./lib/locales";
const PATHS_EXACT_START = ["/_next", "/api"] as const;
const PATHS_INCLUDES = ["/static/", "."] as const;

const defaultLocale = "en-US";
const LOCALE_COOKIE = "NEXT_LOCALE";
const SESSION_COOKIE = "session_type";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    if (isStaticOrApiRoute(pathname)) {
      return NextResponse.next();
    }

    // Check if the pathname already has a locale
    const pathnameHasLocale = LOCALES.some(
      (locale) =>
        pathname.startsWith(`/${locale.value}/`) ||
        pathname === `/${locale.value}`
    );

    let locale: string;
    if (!pathnameHasLocale) {
      // No locale in URL - need to redirect
      locale = getLocalePreference(request);
      request.nextUrl.pathname = `/${locale}${pathname}`;
      const response = NextResponse.redirect(request.nextUrl);
      response.cookies.set(LOCALE_COOKIE, locale, {
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
      return response;
    }

    locale = pathname.split("/")[1];
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, locale, {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    // Log request for debugging
    console.log("Request URL:", request.url);
    console.log("Request Headers:", request.headers.get("accept-language"));
    console.log("Request Cookies:", request.cookies.get(LOCALE_COOKIE));
    console.log("Request Pathname:", pathname);
    console.log("Request Locale:", locale);
    console.log("Request Session Type:", request.cookies.get(SESSION_COOKIE));
    return response;
  } catch (error) {
    return handleMiddlewareError(
      error,
      request.nextUrl.pathname.split("/")[1] || defaultLocale,
      request
    );
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|locales|images).*)",
  ],
};

function getLocaleFromHeaders(request: NextRequest) {
  try {
    const headers = Object.fromEntries(request.headers.entries());
    const languages = new Negotiator({ headers }).languages();
    return match(
      languages,
      LOCALES.map((l) => l.full_value.map((v) => v.toLowerCase())).flat(),
      defaultLocale
    );
  } catch (error) {
    console.error("Error getting locale from headers:", error);
    return defaultLocale;
  }
}

function getLocalePreference(request: NextRequest) {
  try {
    const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
    if (cookieLocale && LOCALES.some((l) => l.value === cookieLocale)) {
      return cookieLocale;
    }
    const headerLocale = getLocaleFromHeaders(request);
    return getShortLocale(headerLocale);
  } catch (error) {
    console.error("Error getting locale preference:", error);
    return defaultLocale;
  }
}

function isStaticOrApiRoute(pathname: string): boolean {
  // Check paths that must match from the start
  const hasExactStart = PATHS_EXACT_START.some((path) =>
    pathname.startsWith(path)
  );

  // Check paths that can match anywhere
  const hasIncluded = PATHS_INCLUDES.some((path) => pathname.includes(path));

  return hasExactStart || hasIncluded;
}

function handleMiddlewareError(
  error: any,
  locale: string,
  request: NextRequest
) {
  const errorParams = new URLSearchParams({
    error: "middleware_error",
    message: error?.message ?? "An unexpected error occurred",
    path: request.nextUrl.pathname,
  });
  request.nextUrl.pathname = `/${locale}/error`;
  request.nextUrl.search = `?${errorParams.toString()}`;
  return NextResponse.redirect(request.nextUrl);
}
