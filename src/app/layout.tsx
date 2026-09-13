import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { SidebarProvider } from "@/context/SidebarContext";


export const metadata: Metadata = {
  title: "Lingo Fox",
  description:
    "A personal multi-language vocabulary manager and retention system powered by spaced repetition.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themePref = cookieStore.get('theme_preference')?.value;
  const sidebarCollapsedCookie = cookieStore.get('sidebar_collapsed')?.value;
  const initialSidebarCollapsed = sidebarCollapsedCookie === '1';
  // Only honour explicit 'dark'/'light'; treat 'system'/undefined as no class (inline script handles system prefs)
  const isDark = themePref === 'dark';
  const isLight = themePref === 'light';
  const htmlClass = [
    'h-full antialiased',
    isDark ? 'dark' : '',
  ].filter(Boolean).join(' ');
  const colorScheme = isDark ? 'dark' : isLight ? 'light' : undefined;

  return (
    <html
      lang="id"
      className={htmlClass}
      data-theme={isDark ? 'dark' : isLight ? 'light' : undefined}
      style={colorScheme ? { colorScheme } : undefined}
      suppressHydrationWarning
    >
      <head />
      <body
        className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans"
        suppressHydrationWarning
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const pref = localStorage.getItem('theme_preference') || 'system';
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = pref === 'dark' || (pref === 'system' && systemDark);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
                // Write cookie so next refresh the server knows the theme immediately
                try { document.cookie = 'theme_preference=' + pref + '; path=/; max-age=31536000; SameSite=Lax'; } catch(e) {}
              } catch (e) {}

              try {
                const accent = localStorage.getItem('lingo_fox_accent_preference') || localStorage.getItem('travel_accent_preference') || 'cyan';
                document.documentElement.setAttribute('data-accent', accent);
              } catch (e) {}

              try {
                const lang = localStorage.getItem('lingo_fox_ui_lang') || localStorage.getItem('language_preference');
                if (lang === 'en' || lang === 'id') {
                  document.documentElement.setAttribute('lang', lang);
                }
              } catch (e) {}

              try {
                const sb = localStorage.getItem('sidebar.collapsed');
                if (sb !== null) {
                  document.cookie = 'sidebar_collapsed=' + sb + '; path=/; max-age=31536000; SameSite=Lax';
                }
              } catch (e) {}

              // Automatically strip third-party browser extension attributes to prevent React hydration warnings
              try {
                const cleanExtAttrs = () => {
                  document.querySelectorAll('[bis_skin_checked]').forEach(el => el.removeAttribute('bis_skin_checked'));
                };
                cleanExtAttrs();
                if (typeof MutationObserver !== 'undefined') {
                  const obs = new MutationObserver((mutations) => {
                    for (let i = 0; i < mutations.length; i++) {
                      const m = mutations[i];
                      if (m.attributeName === 'bis_skin_checked' && m.target && m.target.removeAttribute) {
                        m.target.removeAttribute('bis_skin_checked');
                      }
                    }
                  });
                  obs.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked'] });
                }
              } catch (e) {}
            `,
          }}
        />
        <ThemeProvider>
          <LanguageProvider>
            <SidebarProvider initialCollapsed={initialSidebarCollapsed}>
              {children}
            </SidebarProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
