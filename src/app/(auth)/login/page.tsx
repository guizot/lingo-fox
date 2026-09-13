import { AuthView } from "@/components/AuthView";

export const metadata = {
  title: "Masuk — Lingo Fox",
  description: "Masuk ke akun Lingo Fox Anda",
};

export default function LoginPage() {
  return <AuthView initialMode="signin" />;
}
