"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 1. 댓글 검증 스키마
const CommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "댓글 내용을 입력해 주세요")
    .max(1000, "댓글은 1000자 이하로 입력해주세요"),
});

export type CommentFormState = {
  error?: string | null;
};

// 2. 댓글 저장하기 (Create)
export async function createComment(
  postId: string,
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const raw = String(formData.get("content") ?? "");
  const parsed = CommentSchema.safeParse({ content: raw });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.content?.[0] };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content: parsed.data.content,
  });

  if (error) {
    return { error: "댓글 저장에 실패했습니다: " + error.message };
  }

  revalidatePath(`/posts/${postId}`);
  return { error: null };
}

// 3. 댓글 삭제하기 (Delete)
export async function deleteComment(commentId: number, postId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    throw new Error("댓글 삭제에 실패했습니다: " + error.message);
  }

  revalidatePath(`/posts/${postId}`);
}
