"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ProfileFormState = {
  error: string | null;
  success: boolean;
};

const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

export async function updateProfile(
  prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다.", success: false };
  }

  const nickname = String(formData.get("nickname") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!nickname) {
    return { error: "닉네임을 입력해주세요.", success: false };
  }
  if (nickname.length > 30) {
    return { error: "닉네임은 30자를 넘을 수 없습니다.", success: false };
  }
  if (bio.length > 200) {
    return { error: "자기소개는 200자를 넘을 수 없습니다.", success: false };
  }

  const update: Record<string, unknown> = { nickname, bio, updated_at: new Date().toISOString() };

  const avatar = formData.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(avatar.type)) {
      return { error: "jpg, png 파일만 업로드할 수 있습니다.", success: false };
    }
    if (avatar.size > MAX_IMAGE_BYTES) {
      return { error: "이미지 용량은 3MB를 넘을 수 없습니다.", success: false };
    }

    const ext = avatar.type === "image/png" ? "png" : "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatar, { contentType: avatar.type, upsert: true });

    if (uploadError) {
      return { error: "이미지 업로드에 실패했습니다: " + uploadError.message, success: false };
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // 캐시 무효화를 위해 타임스탬프 쿼리 파라미터 추가
    update.avatar_url = `${data.publicUrl}?t=${Date.now()}`;
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...update });

  if (error) {
    return { error: "프로필 저장에 실패했습니다: " + error.message, success: false };
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { error: null, success: true };
}
