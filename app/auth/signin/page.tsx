"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/70 p-8 shadow-xl shadow-black/50">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
            Nightscout Admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Sign in to continue
          </h1>
          <p className="text-sm text-slate-400">
            This internal dashboard is restricted to the Nightscout backup
            owner. Authenticate with Discord to proceed.
          </p>
        </div>

        <button
          onClick={() => signIn("discord", { callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4752c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-base">
            {/* Simple Discord icon glyph */}
            <span className="-mt-0.5">💬</span>
          </span>
          <span>Sign in with Discord</span>
        </button>

        <p className="mt-4 text-center text-xs text-slate-500">
          Access is limited to a single Discord account. If you are not the
          configured owner, sign-in will be denied.
        </p>
      </div>
    </main>
  );
}


