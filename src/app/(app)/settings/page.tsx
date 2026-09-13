import { requireUser } from "@/lib/auth/server";
import { SettingsView } from "@/components/SettingsView";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <SettingsView
      user={{
        id: user.id,
        email: user.email,
        name: user.name,
      }}
    />
  );
}
