import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { deletePost } from "@/app/posts/actions";
import { CommentSection } from "@/app/posts/_components/comment-section";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === post.user_id;

  // 댓글 조회
  const { data: comments } = await supabase
    .from("comments")
    .select("id, content, created_at, user_id")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-col gap-6 p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
        {post.category && (
          <span className="rounded bg-black/5 px-2 py-0.5 dark:bg-white/10">
            {post.category}
          </span>
        )}
        <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">{post.title}</h1>

      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {post.content}
      </p>

      <div className="flex items-center gap-3 border-t border-black/10 pt-4 dark:border-white/15">
        <Link href="/posts" className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
          목록으로
        </Link>

        {isOwner && (
          <>
            <Link
              href={`/posts/${post.id}/edit`}
              className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
            >
              수정
            </Link>
            <form action={deletePost.bind(null, post.id)}>
              <button
                type="submit"
                className="text-sm text-red-500 hover:text-red-600"
              >
                삭제
              </button>
            </form>
          </>
        )}
      </div>

      <CommentSection
        postId={post.id}
        comments={comments ?? []}
        currentUserId={user?.id}
      />
    </div>
  );
}
