// src/app/(public)/login/page.tsx
import { Suspense } from "react";
import LoginClient from "./ui/LoginClient";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md p-6 min-h-screen flex flex-col justify-center">
      <h1 className="mb-4 text-5xl font-semibold font-fancy text-yuvi-rose text-center">
        LOGIN
      </h1>
      <Suspense fallback={<p className="text-sm text-slate-600">Lade…</p>}>
        <LoginClient />
      </Suspense>
    </main>
  );
}
