import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { getLanguages, getUserLanguages, addUserLanguage } from "@/lib/db/languages";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getSession();

  if (!user) {
    redirect("/login");
  }

  const [allLanguages, initialUserLanguages] = await Promise.all([
    getLanguages(),
    getUserLanguages(user.id),
  ]);
  let userLanguages = initialUserLanguages;

  // If new user with no languages, initialize with German and Indonesian translation support
  if (userLanguages.length === 0) {
    const german = allLanguages.find((l) => l.code === "de") || allLanguages[0];
    const indonesian = allLanguages.find((l) => l.code === "id");
    const defaultUserLang = await addUserLanguage(
      user.id,
      german.id,
      indonesian?.id || null
    );
    userLanguages = [defaultUserLang];
  }

  const cookieStore = await cookies();
  const activeLangCookie = cookieStore.get("lingo_fox_active_lang") || cookieStore.get("grwly_active_lang");

  let activeLanguageId = activeLangCookie?.value
    ? parseInt(activeLangCookie.value, 10)
    : userLanguages[0].languageId;

  // Validate that active language exists in user's enrolled languages
  if (!userLanguages.some((ul) => ul.languageId === activeLanguageId)) {
    activeLanguageId = userLanguages[0].languageId;
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Sidebar (Desktop Sticky + Mobile Drawer) */}
      <Sidebar user={user} />

      {/* Main App Content Area */}
      <div className="flex flex-1 flex-col w-full min-w-0 pt-14 md:pt-0 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <Header
          userLanguages={userLanguages}
          allLanguages={allLanguages}
          activeLanguageId={activeLanguageId}
          userName={user.name}
          userEmail={user.email}
        />
        <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
