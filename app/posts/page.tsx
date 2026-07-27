import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "블로그",
};

type Post = {
  id: string;
  title: string;
  summary: string | null;
  category: string | null;
  created_at: string;
};

function groupByMonth(posts: Post[]) {
  const groups: Record<string, Post[]> = {};
  for (const post of posts) {
    const date = new Date(post.created_at);
    const key = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(post);
  }
  return groups;
}

export default async function PostsPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, summary, category, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="p-8 text-red-500">글을 불러오지 못했습니다: {error.message}</p>;
  }

  const grouped = groupByMonth((posts as Post[]) ?? []);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">개발 기록</h1>
        <Link
          href="/posts/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          새 글 쓰기
        </Link>
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">
          아직 작성된 글이 없습니다. 첫 글을 남겨보세요!
        </p>
      )}

      {Object.entries(grouped).map(([month, monthPosts]) => (
        <div key={month} className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-black/50 dark:text-white/50">
            {month}
          </h2>
          <div className="flex flex-col gap-3">
            {monthPosts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="rounded-md border border-black/10 p-4 hover:border-black/30 dark:border-white/15 dark:hover:border-white/40"
              >
                <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
                  {post.category && (
                    <span className="rounded bg-black/5 px-2 py-0.5 dark:bg-white/10">
                      {post.category}
                    </span>
                  )}
                  <span>
                    {new Date(post.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <h3 className="mt-2 font-medium">{post.title}</h3>
                {post.summary && (
                  <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                    {post.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
