"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export async function loginAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!email || !password) {
    return { error: "Alamat email dan kata sandi wajib diisi." };
  }

  const cookieStore = await cookies();

  // If live Neon Auth is configured, authenticate directly with Neon Auth endpoint
  if (process.env.NEON_AUTH_BASE_URL) {
    try {
      const headerStore = await headers();
      const origin =
        headerStore.get("origin") ||
        headerStore.get("referer")?.split("/").slice(0, 3).join("/") ||
        "http://localhost:3000";

      const response = await fetch(`${process.env.NEON_AUTH_BASE_URL}/sign-in/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: origin,
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (
          response.status === 401 ||
          errorData?.message?.toLowerCase().includes("invalid") ||
          errorData?.code === "INVALID_EMAIL_OR_PASSWORD"
        ) {
          return { error: "Email atau kata sandi salah. Silakan coba lagi." };
        }
        return {
          error: errorData?.message || "Gagal masuk ke akun. Silakan periksa kredensial Anda.",
        };
      }

      const data = await response.json();
      const user = data.user || {
        id: `user_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
        name: email.split("@")[0] || "Learner",
        email,
      };

      // Forward set-cookie headers from Neon Auth
      const setCookies = response.headers.getSetCookie();
      for (const cookieStr of setCookies) {
        const [nameVal] = cookieStr.split(";");
        const [cName, ...cValParts] = nameVal.split("=");
        if (cName && cValParts.length > 0) {
          cookieStore.set(cName.trim(), cValParts.join("=").trim(), {
            path: "/",
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
          });
        }
      }

      // Set our primary session cookie
      const sessionPayload = JSON.stringify({
        id: user.id,
        name: user.name || email.split("@")[0] || "Learner",
        email: user.email,
      });
      cookieStore.set("lingo_fox_session", sessionPayload, { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
      cookieStore.set("grwly_session", sessionPayload, { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 });

      // Upsert into PostgreSQL profiles table if db is available
      if (db) {
        try {
          await db
            .insert(profiles)
            .values({
              id: user.id,
              displayName: user.name || email.split("@")[0],
            })
            .onConflictDoNothing();
        } catch (dbErr) {
          console.warn("Could not upsert profile:", dbErr);
        }
      }

      return { success: true };
    } catch (e: any) {
      console.error("Neon Auth sign-in error:", e);
      return { error: e.message || "Gagal menghubungi server autentikasi." };
    }
  } else {
    // Development fallback
    const id = `user_${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const devPayload = JSON.stringify({
      id,
      name: email.split("@")[0] || "Learner",
      email,
    });
    cookieStore.set("lingo_fox_session", devPayload, { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("grwly_session", devPayload, { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    return { success: true };
  }
}

export async function signupAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  if (password.length < 6) {
    return { error: "Kata sandi minimal 6 karakter." };
  }

  const cookieStore = await cookies();

  if (process.env.NEON_AUTH_BASE_URL) {
    try {
      const headerStore = await headers();
      const origin =
        headerStore.get("origin") ||
        headerStore.get("referer")?.split("/").slice(0, 3).join("/") ||
        "http://localhost:3000";

      const response = await fetch(`${process.env.NEON_AUTH_BASE_URL}/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: origin,
        },
        body: JSON.stringify({
          name: name || email.split("@")[0],
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (
          errorData?.message?.toLowerCase().includes("already") ||
          errorData?.code === "USER_ALREADY_EXISTS"
        ) {
          return { error: "Email ini sudah terdaftar. Silakan langsung masuk." };
        }
        return { error: errorData?.message || "Gagal mendaftarkan akun." };
      }

      const data = await response.json();
      const user = data.user || {
        id: `user_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
        name: name || email.split("@")[0] || "Learner",
        email,
      };

      // Forward set-cookie headers
      const setCookies = response.headers.getSetCookie();
      for (const cookieStr of setCookies) {
        const [nameVal] = cookieStr.split(";");
        const [cName, ...cValParts] = nameVal.split("=");
        if (cName && cValParts.length > 0) {
          cookieStore.set(cName.trim(), cValParts.join("=").trim(), {
            path: "/",
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
          });
        }
      }

      const signupPayload = JSON.stringify({
        id: user.id,
        name: user.name || name || email.split("@")[0] || "Learner",
        email: user.email,
      });
      cookieStore.set("lingo_fox_session", signupPayload, { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
      cookieStore.set("grwly_session", signupPayload, { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 });

      if (db) {
        try {
          await db
            .insert(profiles)
            .values({
              id: user.id,
              displayName: user.name || name || email.split("@")[0],
            })
            .onConflictDoNothing();
        } catch (dbErr) {
          console.warn("Could not upsert profile:", dbErr);
        }
      }

      return { success: true };
    } catch (e: any) {
      console.error("Neon Auth sign-up error:", e);
      return { error: e.message || "Gagal menghubungi server autentikasi." };
    }
  } else {
    const id = `user_${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const devSignupPayload = JSON.stringify({
      id,
      name: name || email.split("@")[0] || "Learner",
      email,
    });
    cookieStore.set("lingo_fox_session", devSignupPayload, { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("grwly_session", devSignupPayload, { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    return { success: true };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("lingo_fox_session");
  cookieStore.delete("grwly_session");
  cookieStore.delete("lingo_fox_dev_session");
  cookieStore.delete("grwly_dev_session");
  cookieStore.delete("neon-auth.session_token");
  cookieStore.delete("__Secure-neon-auth.session_token");
  cookieStore.delete("neon-auth.session_data");
  cookieStore.delete("__Secure-neon-auth.session_data");
  redirect("/login");
}

export async function updateProfileAction(newName: string) {
  const cleanName = newName?.trim();
  if (!cleanName) {
    return { error: "Nama tidak boleh kosong." };
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("lingo_fox_session") || cookieStore.get("grwly_session");

  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(sessionCookie.value);
      parsed.name = cleanName;
      const updatedPayload = JSON.stringify(parsed);
      cookieStore.set("lingo_fox_session", updatedPayload, { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
      cookieStore.set("grwly_session", updatedPayload, { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 });

      if (db && parsed.id) {
        try {
          await db
            .insert(profiles)
            .values({ id: parsed.id, displayName: cleanName })
            .onConflictDoUpdate({
              target: profiles.id,
              set: { displayName: cleanName, updatedAt: new Date() },
            });
        } catch (dbErr) {
          console.warn("Could not update profile in db:", dbErr);
        }
      }
      return { success: true };
    } catch (e: any) {
      return { error: e.message || "Gagal memperbarui profil." };
    }
  }
  return { error: "Sesi tidak ditemukan." };
}

