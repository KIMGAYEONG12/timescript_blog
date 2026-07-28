import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-8 py-4">
        <Link href="/posts" className="font-semibold tracking-tight">
          개발 기록
        </Link>

        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/profile"
              className="text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
            >
              프로필 설정
            </Link>
            <span className="text-black/20 dark:text-white/20">|</span>
            <span className="text-black/60 dark:text-white/60">
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
              >
                로그아웃
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
