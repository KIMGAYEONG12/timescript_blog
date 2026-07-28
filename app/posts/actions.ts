"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type PostFormState = {
  errors: {
    title?: string[];
    content?: string[];
    image?: string[];
  };
  message: string | null;
  values?: {
    title: string;
    content: string;
  };
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

async function uploadPostImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  image: File,
) {
  const ext = image.type === "image/png" ? "png" : "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, image, { contentType: image.type, upsert: false });

  if (error) {
    throw new Error("이미지 업로드에 실패했습니다: " + error.message);
  }

  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
}

function validatePost(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const errors: PostFormState["errors"] = {};

  if (!title) {
    errors.title = ["제목을 입력해주세요."];
  } else if (title.length > 100) {
    errors.title = ["제목은 100자를 넘을 수 없습니다."];
  }

  if (!content) {
    errors.content = ["내용을 입력해주세요."];
  } else if (content.length > 5000) {
    errors.content = ["내용은 5000자를 넘을 수 없습니다."];
  }

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      errors.image = ["jpg, png 파일만 첨부할 수 있습니다."];
    } else if (image.size > MAX_IMAGE_BYTES) {
      errors.image = ["이미지 용량은 5MB를 넘을 수 없습니다."];
    }
  }

  return { title, content, errors };
}

export async function createPost(
  prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { errors: {}, message: "로그인이 필요합니다." };
  }

  const { title, content, errors } = validatePost(formData);
  const category = String(formData.get("category") ?? "수업(TIL)");
  const summary = String(formData.get("summary") ?? "").trim() || null;

  if (Object.keys(errors).length > 0) {
    return { errors, message: null, values: { title, content } };
  }

  let image_url: string | null = null;
  const image = formData.get("image");

  try {
    if (image instanceof File && image.size > 0) {
      image_url = await uploadPostImage(supabase, user.id, image);
    }
  } catch (e) {
    return {
      errors: {},
      message: e instanceof Error ? e.message : "이미지 업로드에 실패했습니다.",
      values: { title, content },
    };
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ title, content, summary, category, image_url, user_id: user.id })
    .select("id")
    .single();

  if (error) {
    return { errors: {}, message: "글 등록에 실패했습니다: " + error.message, values: { title, content } };
  }

  revalidatePath("/posts");
  redirect(`/posts/${data.id}`);
}

export async function updatePost(
  postId: string,
  prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { errors: {}, message: "로그인이 필요합니다." };
  }

  const { title, content, errors } = validatePost(formData);
  const category = String(formData.get("category") ?? "수업(TIL)");
  const summary = String(formData.get("summary") ?? "").trim() || null;

  if (Object.keys(errors).length > 0) {
    return { errors, message: null, values: { title, content } };
  }

  const update: Record<string, unknown> = { title, content, summary, category };
  const image = formData.get("image");

  try {
    if (image instanceof File && image.size > 0) {
      update.image_url = await uploadPostImage(supabase, user.id, image);
    }
  } catch (e) {
    return {
      errors: {},
      message: e instanceof Error ? e.message : "이미지 업로드에 실패했습니다.",
      values: { title, content },
    };
  }

  const { error } = await supabase
    .from("posts")
    .update(update)
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) {
    return { errors: {}, message: "글 수정에 실패했습니다: " + error.message, values: { title, content } };
  }

  revalidatePath("/posts");
  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}
