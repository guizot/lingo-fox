import { AuthView } from "@/components/AuthView";

export const metadata = {
  title: "Daftar Akun — Lingo Fox",
  description: "Buat akun baru di Lingo Fox",
};

export default function SignupPage() {
  return <AuthView initialMode="signup" />;
}
