import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PostForm } from "../../post-form";
import { updatePost } from "../../actions";

export const metadata = {
  title: "글 수정",
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, content, summary, category, image_url")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-8 max-w-2xl mx-auto">
        <Link
          href={`/posts/${id}`}
          className="text-sm text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
        >
          ← 글로 돌아가기
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

  const boundUpdatePost = updatePost.bind(null, id);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">글 수정</h1>
      <PostForm
        submitLabel="수정하기"
        cancelHref={`/posts/${id}`}
        action={boundUpdatePost}
        defaultValues={{
          title: post.title,
          content: post.content,
          summary: post.summary ?? "",
          category: post.category ?? "수업(TIL)",
          imageUrl: post.image_url ?? undefined,
        }}
      />
    </div>
  );
}
