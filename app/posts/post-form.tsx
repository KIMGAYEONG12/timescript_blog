"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { PostFormState } from "./actions";

const FIELD_CLASS =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/20 dark:focus:border-white/50";

const CATEGORIES = ["수업(TIL)", "오늘배운것", "리뷰"];

type PostFormAction = (
  prevState: PostFormState,
  formData: FormData,
) => Promise<PostFormState>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "저장 중..." : label}
    </button>
  );
}

export function PostForm({
  defaultValues,
  submitLabel,
  cancelHref,
  action,
}: {
  defaultValues?: {
    title: string;
    content: string;
    summary?: string;
    category?: string;
    imageUrl?: string;
  };
  submitLabel: string;
  cancelHref: string;
  action: PostFormAction;
}) {
  const [state, formAction] = useActionState(action, {
    errors: {},
    message: null,
  });
  const [preview, setPreview] = useState<string | null>(
    defaultValues?.imageUrl ?? null,
  );

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(defaultValues?.imageUrl ?? null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.message && <p className="text-sm text-red-500">{state.message}</p>}

      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-medium">
          카테고리
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaultValues?.category ?? CATEGORIES[0]}
          className={FIELD_CLASS}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          제목
        </label>
        <input
          id="title"
          type="text"
          name="title"
          defaultValue={state.values?.title ?? defaultValues?.title ?? ""}
          maxLength={100}
          placeholder="글 제목을 입력하세요"
          className={FIELD_CLASS}
        />
        {state.errors?.title && (
          <p className="text-xs text-red-500">{state.errors.title[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="summary" className="text-sm font-medium">
          한 줄 요약
        </label>
        <input
          id="summary"
          type="text"
          name="summary"
          defaultValue={defaultValues?.summary ?? ""}
          maxLength={200}
          placeholder="목록에 보일 짧은 요약"
          className={FIELD_CLASS}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="content" className="text-sm font-medium">
          내용
        </label>
        <textarea
          id="content"
          name="content"
          defaultValue={state.values?.content ?? defaultValues?.content ?? ""}
          maxLength={5000}
          rows={12}
          placeholder="내용을 입력하세요"
          className={FIELD_CLASS}
        />
        {state.errors?.content && (
          <p className="text-xs text-red-500">{state.errors.content[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="image" className="text-sm font-medium">
          이미지 첨부
        </label>
        <input
          id="image"
          type="file"
          name="image"
          accept="image/png, image/jpeg"
          onChange={handleImageChange}
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-black/5 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-black/10 dark:file:bg-white/10 dark:hover:file:bg-white/15"
        />
        <p className="text-xs text-black/50 dark:text-white/50">
          jpg, png 파일만 첨부 가능 (최대 5MB)
        </p>
        {state.errors?.image && (
          <p className="text-xs text-red-500">{state.errors.image[0]}</p>
        )}
        {preview && (
          <div className="relative mt-2 h-40 w-full overflow-hidden rounded-md border border-black/10 dark:border-white/15">
            <Image
              src={preview}
              alt="첨부 이미지 미리보기"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link
          href={cancelHref}
          className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
