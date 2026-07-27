"use client";

import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function signInWithGithub() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 max-w-sm mx-auto min-h-[60vh]">
      <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
      <p className="text-sm text-black/60 dark:text-white/60 text-center">
        소셜 계정으로 로그인하고 글을 작성해보세요.
      </p>

      <button
        onClick={signInWithGoogle}
        className="w-full rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
      >
        Google로 로그인
      </button>

      <button
        onClick={signInWithGithub}
        className="w-full rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
      >
        GitHub로 로그인
      </button>
    </div>
  );
}
