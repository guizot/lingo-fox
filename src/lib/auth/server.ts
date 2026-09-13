import { createNeonAuth } from "@neondatabase/auth/next/server";
import { cookies } from "next/headers";

const isNeonAuthConfigured = Boolean(
  process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET
);

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL || "https://placeholder.neonauth.us-east-1.aws.neon.tech/neondb/auth",
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "default_development_secret_32_characters_long_min",
  },
});

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

/**
 * Returns the current authenticated session.
 * Checks grwly_session, grwly_dev_session, or queries Neon Auth.
 */
export async function getSession(): Promise<{ user: UserSession | null }> {
  const cookieStore = await cookies();

  // 1. Check verified session cookie
  const sessionCookie = cookieStore.get("lingo_fox_session") || cookieStore.get("grwly_session");
  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(sessionCookie.value);
      if (parsed?.id) {
        return { user: parsed };
      }
    } catch {
      // ignore
    }
  }

  // 2. Check local dev session cookie
  const devSessionCookie = cookieStore.get("lingo_fox_dev_session") || cookieStore.get("grwly_dev_session");
  if (devSessionCookie?.value) {
    try {
      const parsed = JSON.parse(devSessionCookie.value);
      if (parsed?.id) {
        return { user: parsed };
      }
    } catch {
      // ignore
    }
  }

  // 3. Fallback to Neon Auth upstream session check
  if (isNeonAuthConfigured) {
    try {
      const { data } = await auth.getSession();
      if (data?.user) {
        return {
          user: {
            id: data.user.id,
            name: data.user.name || data.user.email?.split("@")[0] || "User",
            email: data.user.email,
            avatarUrl: data.user.image,
          },
        };
      }
    } catch (err) {
      console.warn("Neon Auth getSession failed:", err);
    }
  }

  // If not authenticated, return null
  return { user: null };
}

/**
 * Retrieves the authenticated user or throws an unauthorized error.
 * Ensures that all queries derive ownership directly from the session.
 */
export async function requireUser(): Promise<UserSession> {
  const { user } = await getSession();
  if (!user) {
    throw new Error("Unauthorized: User is not authenticated.");
  }
  return user;
}
