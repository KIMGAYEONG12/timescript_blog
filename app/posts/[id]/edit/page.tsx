import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { updatePost } from "@/app/posts/actions";
import { PostForm } from "@/app/posts/_components/post-form";

export default async function EditPostPage({
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

  const updatePostWithId = updatePost.bind(null, id);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">글 수정</h1>
      <PostForm
        action={updatePostWithId}
        submitLabel="수정 완료"
        cancelHref={`/posts/${id}`}
        defaultValues={{
          title: post.title,
          content: post.content,
          summary: post.summary ?? "",
          category: post.category ?? "",
        }}
      />
    </div>
  );
}
