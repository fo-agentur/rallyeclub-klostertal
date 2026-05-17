import { connection } from "next/server";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { ChangePasswordForm } from "./change-password-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Passwort ändern",
  robots: { index: false, follow: false },
};

export default async function AdminPasswordPage() {
  await connection();
  if (!(await isAuthenticated())) redirect("/admin");

  return (
    <div className="section">
      <div className="container-wide max-w-2xl">
        <div className="eyebrow">Admin</div>
        <h1 className="mt-2 font-display text-4xl tracking-wider text-ink">Passwort ändern</h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          Das neue Passwort wird in der Datenbank gespeichert. Die Umgebungsvariable{" "}
          <span className="font-mono text-xs text-neutral-800">ADMIN_PASSWORD_HASH</span> gilt nur
          noch, solange noch kein Eintrag in der Datenbank existiert (erster Start / Reset).
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
