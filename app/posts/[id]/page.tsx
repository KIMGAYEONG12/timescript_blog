import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CommentList } from "./comment-list";
import { CommentForm } from "./comment-form";

type Post = {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
};

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, content, summary, category, image_url, created_at, user_id")
    .eq("id", id)
    .maybeSingle();

  // 진짜로 글이 없는 경우(0건)에만 404를 보여준다.
  // 그 외의 에러(컬럼 없음, 권한 문제 등)는 원인을 그대로 화면에 보여줘서
  // "이유 없는 404"로 헷갈리지 않게 한다.
  if (error) {
    return (
      <div className="flex flex-col gap-4 p-8 max-w-2xl mx-auto">
        <Link
          href="/posts"
          className="text-sm text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
        >
          ← 목록으로
        </Link>
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          글을 불러오지 못했습니다: {error.message}
        </p>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  const typedPost = post as Post;
  const isOwner = user?.id === typedPost.user_id;

  return (
    <div className="flex flex-col gap-10 p-8 max-w-2xl mx-auto">
      <article className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/posts"
            className="text-sm text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
          >
            ← 목록으로
          </Link>
          {isOwner && (
            <Link
              href={`/posts/${typedPost.id}/edit`}
              className="text-sm text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
            >
              수정
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
          {typedPost.category && (
            <span className="rounded bg-black/5 px-2 py-0.5 dark:bg-white/10">
              {typedPost.category}
            </span>
          )}
          <span>{new Date(typedPost.created_at).toLocaleDateString("ko-KR")}</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">{typedPost.title}</h1>

        {typedPost.image_url && (
          <div className="relative h-64 w-full overflow-hidden rounded-md border border-black/10 dark:border-white/15">
            <Image
              src={typedPost.image_url}
              alt={typedPost.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {typedPost.content}
        </p>
      </article>

      <hr className="border-black/10 dark:border-white/15" />

      <section className="flex flex-col gap-6">
        <CommentForm postId={typedPost.id} isLoggedIn={!!user} />
        <CommentList postId={typedPost.id} />
      </section>
    </div>
  );
}
