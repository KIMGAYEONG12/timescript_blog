"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// 1. 데이터 검증 스키마
const PostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "제목을 입력해 주세요")
    .max(100, "제목은 100자 이하로 입력해주세요"),
  content: z
    .string()
    .trim()
    .min(1, "내용을 입력해 주세요")
    .max(5000, "내용은 5000자 이하로 입력해주세요"),
  summary: z.string().trim().max(200, "요약은 200자 이하로 입력해주세요").optional(),
  category: z.string().trim().optional(),
});

// 2. form에서 전달받은 데이터 정리
function readForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    category: String(formData.get("category") ?? ""),
  };
}

export type PostFormState = {
  errors?: {
    title?: string[];
    content?: string[];
  };
  message?: string | null;
  values?: {
    title: string;
    content: string;
    summary: string;
    category: string;
  };
};

// 3. 게시글 작성하기 (Create)
export async function createPost(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const raw = readForm(formData);
  const parsed = PostSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "입력값을 다시 확인해주세요",
      values: raw,
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "로그인이 필요합니다", values: raw };
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ ...parsed.data, user_id: user.id })
    .select("id")
    .single();

  if (error) {
    return { message: "저장에 실패했습니다: " + error.message, values: raw };
  }

  revalidatePath("/posts");
  redirect(`/posts/${data.id}`);
}

// 4. 게시글 수정하기 (Update)
export async function updatePost(
  id: string,
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const raw = readForm(formData);
  const parsed = PostSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "입력값을 다시 확인해주세요",
      values: raw,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return { message: "수정에 실패했습니다: " + error.message, values: raw };
  }

  revalidatePath("/posts");
  revalidatePath(`/posts/${id}`);
  redirect(`/posts/${id}`);
}

// 5. 게시글 삭제하기 (Delete)
export async function deletePost(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    throw new Error("삭제에 실패했습니다: " + error.message);
  }

  revalidatePath("/posts");
  redirect("/posts");
}
