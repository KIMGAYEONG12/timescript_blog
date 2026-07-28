"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile, ProfileFormState } from "./actions";

const FIELD_CLASS =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/20 dark:focus:border-white/50";

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "저장 중..." : "저장하기"}
    </button>
  );
}

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: { nickname: string; bio: string; avatarUrl: string | null };
}) {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    { error: null, success: false },
  );
  const [preview, setPreview] = useState<string | null>(defaultValues.avatarUrl);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          프로필이 저장되었습니다.
        </p>
      )}

      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-black/10 bg-black/5 dark:border-white/15 dark:bg-white/10">
          {preview ? (
            <Image src={preview} alt="프로필 이미지" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-medium text-black/40 dark:text-white/40">
              {defaultValues.nickname.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="avatar" className="text-sm font-medium">
            프로필 이미지
          </label>
          <input
            id="avatar"
            type="file"
            name="avatar"
            accept="image/png, image/jpeg"
            onChange={handleAvatarChange}
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-black/5 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-black/10 dark:file:bg-white/10 dark:hover:file:bg-white/15"
          />
          <p className="text-xs text-black/50 dark:text-white/50">
            jpg, png 파일만 업로드 가능 (최대 3MB)
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="nickname" className="text-sm font-medium">
          닉네임
        </label>
        <input
          id="nickname"
          type="text"
          name="nickname"
          defaultValue={defaultValues.nickname}
          maxLength={30}
          placeholder="닉네임을 입력하세요"
          className={FIELD_CLASS}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="bio" className="text-sm font-medium">
          자기소개
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={defaultValues.bio}
          maxLength={200}
          rows={4}
          placeholder="자기소개를 입력하세요"
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <SaveButton />
      </div>
    </form>
  );
}
