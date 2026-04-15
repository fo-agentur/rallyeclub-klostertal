import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  if (await isAuthenticated()) redirect("/admin/dashboard");

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm border border-neutral-200 bg-white p-8">
        <div className="eyebrow">Rallyeclub Klostertal</div>
        <h1 className="mt-2 font-display text-3xl tracking-wider text-ink">Admin-Login</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Bitte Passwort eingeben, um fortzufahren.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
