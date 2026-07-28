"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type CommentFormState = {
  error: string | null;
  success: boolean;
};

export async function addComment(
  postId: string,
  prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "댓글을 작성하려면 로그인이 필요합니다.", success: false };
  }

  const content = String(formData.get("content") ?? "").trim();

  if (!content) {
    return { error: "댓글 내용을 입력해주세요.", success: false };
  }
  if (content.length > 500) {
    return { error: "댓글은 500자를 넘을 수 없습니다.", success: false };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content,
  });

  if (error) {
    return { error: "댓글 등록에 실패했습니다: " + error.message, success: false };
  }

  revalidatePath(`/posts/${postId}`);
  return { error: null, success: true };
}

export async function deleteComment(commentId: string, postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("comments").delete().eq("id", commentId).eq("user_id", user.id);
  revalidatePath(`/posts/${postId}`);
}
